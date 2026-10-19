import { Comision } from "../comisiones/types";

export interface ParsedSchedule {
  raw: string;
  days: string[];
  startMinutes: number;
  endMinutes: number;
  isValid: boolean;
}

export function parseScheduleString(scheduleStr: string): ParsedSchedule {
  if (!scheduleStr) {
    return { raw: scheduleStr, days: [], startMinutes: 0, endMinutes: 0, isValid: false };
  }

  const normalized = scheduleStr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents for matching

  // Extract days
  const days: string[] = [];

  if (normalized.includes("lunes a jueves")) {
    days.push("lunes", "martes", "miercoles", "jueves");
  } else if (normalized.includes("lunes a viernes")) {
    days.push("lunes", "martes", "miercoles", "jueves", "viernes");
  } else {
    if (normalized.includes("lunes")) days.push("lunes");
    if (normalized.includes("martes")) days.push("martes");
    if (normalized.includes("miercoles")) days.push("miercoles");
    if (normalized.includes("jueves")) days.push("jueves");
    if (normalized.includes("viernes")) days.push("viernes");
    if (normalized.includes("sabado")) days.push("sabado");
    if (normalized.includes("domingo")) days.push("domingo");
  }

  // Extract time range (e.g., "16:30 - 18:00" or "09:30 a 11:00" or "10:00 - 11:15 hs")
  const timeRegex = /(\d{1,2}):(\d{2})\s*(?:hs)?\s*(?:-|a|hasta)\s*(\d{1,2}):(\d{2})/;
  const match = normalized.match(timeRegex);

  let startMinutes = 0;
  let endMinutes = 0;
  let isValid = false;

  if (match) {
    const h1 = parseInt(match[1], 10);
    const m1 = parseInt(match[2], 10);
    const h2 = parseInt(match[3], 10);
    const m2 = parseInt(match[4], 10);

    startMinutes = h1 * 60 + m1;
    endMinutes = h2 * 60 + m2;

    if (days.length > 0 && endMinutes > startMinutes) {
      isValid = true;
    }
  }

  return {
    raw: scheduleStr,
    days,
    startMinutes,
    endMinutes,
    isValid,
  };
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingComision?: Comision;
  conflictDetails?: string;
}

/**
 * Checks if the given aula and schedule conflict with any other commission in the same aula.
 */
export function checkScheduleConflict(
  aulaId: string | undefined,
  diasHorarios: string,
  currentComisionId: string | undefined,
  allComisiones: Comision[]
): ConflictCheckResult {
  if (!aulaId || !diasHorarios) {
    return { hasConflict: false };
  }

  const targetParsed = parseScheduleString(diasHorarios);
  if (!targetParsed.isValid) {
    return { hasConflict: false };
  }

  // Filter commissions assigned to the same aula and active
  const sameAulaComisiones = allComisiones.filter(
    (c) =>
      c.activo &&
      c.id !== currentComisionId &&
      (c.aulaId === aulaId || c.aulaFisica.toLowerCase().includes(aulaId.toLowerCase()))
  );

  for (const com of sameAulaComisiones) {
    const otherParsed = parseScheduleString(com.diasHorarios);
    if (!otherParsed.isValid) continue;

    // Check if they share at least one common day
    const commonDays = targetParsed.days.filter((d) => otherParsed.days.includes(d));
    if (commonDays.length === 0) continue;

    // Check if time intervals overlap: start1 < end2 && end1 > start2
    const overlaps =
      targetParsed.startMinutes < otherParsed.endMinutes &&
      targetParsed.endMinutes > otherParsed.startMinutes;

    if (overlaps) {
      const daysCapitalized = commonDays
        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
        .join(" y ");

      return {
        hasConflict: true,
        conflictingComision: com,
        conflictDetails: `El aula ya se encuentra ocupada por "${com.nombre}" los días ${daysCapitalized} (${com.diasHorarios}). Los horarios se superponen.`,
      };
    }
  }

  return { hasConflict: false };
}

export interface OperatingHoursCheckResult {
  isWithinRange: boolean;
  details?: string;
}

/**
 * Valida si el horario de la comisión se encuentra dentro de la franja horaria permitida para el aula.
 */
export function checkWithinAulaOperatingHours(
  diasHorarios: string,
  horarioInicio?: string,
  horarioFin?: string
): OperatingHoursCheckResult {
  if (!diasHorarios) {
    return { isWithinRange: true };
  }

  const parsed = parseScheduleString(diasHorarios);
  if (!parsed.isValid) {
    return { isWithinRange: true };
  }

  // Institutional campus operating window: 09:00 to 21:30
  const effectiveStart = horarioInicio && horarioInicio < "09:00" ? horarioInicio : "09:00";
  const effectiveEnd = horarioFin && horarioFin > "21:30" ? horarioFin : "21:30";

  const [h1, m1] = effectiveStart.split(":").map((v) => parseInt(v, 10));
  const [h2, m2] = effectiveEnd.split(":").map((v) => parseInt(v, 10));
  const startLimitMinutes = (isNaN(h1) ? 9 : h1) * 60 + (isNaN(m1) ? 0 : m1);
  const endLimitMinutes = (isNaN(h2) ? 21 : h2) * 60 + (isNaN(m2) ? 30 : m2);

  if (parsed.startMinutes < startLimitMinutes || parsed.endMinutes > endLimitMinutes) {
    return {
      isWithinRange: false,
      details: `El horario "${diasHorarios}" excede la franja de uso institucional permitida (${effectiveStart} a ${effectiveEnd} hs).`,
    };
  }

  return { isWithinRange: true };
}
