import { CobranzaItem } from "./types";
import { EstudianteItem } from "@/features/estudiantes/types";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * Normaliza cualquier número de teléfono (especialmente de Argentina/La Plata/Ensenada)
 * al formato internacional requerido por WhatsApp: 549 + código de área sin 0 + número sin 15.
 */
export function cleanArgentineWhatsAppNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";

  // Ya tiene formato internacional completo con 549 (ej: 5492214923344)
  if (digits.startsWith("549") && digits.length >= 12) {
    return digits;
  }

  // Comienza con 54 pero le falta el 9 móvil (ej: 540221... o 5422115...)
  if (digits.startsWith("54") && !digits.startsWith("549")) {
    let rest = digits.slice(2);
    if (rest.startsWith("0")) rest = rest.slice(1);
    // Eliminar '15' luego de códigos de área típicos
    if (rest.startsWith("22115")) rest = "221" + rest.slice(5);
    else if (rest.startsWith("1115")) rest = "11" + rest.slice(4);
    else if (rest.startsWith("35115")) rest = "351" + rest.slice(5);
    else if (rest.startsWith("34115")) rest = "341" + rest.slice(5);
    return "549" + rest;
  }

  // Quitar el 0 inicial si lo tiene (ej: 0221...)
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Manejar el '15' en celulares locales
  if (digits.startsWith("22115")) {
    digits = "221" + digits.slice(5);
  } else if (digits.startsWith("1115")) {
    digits = "11" + digits.slice(4);
  } else if (digits.startsWith("35115")) {
    digits = "351" + digits.slice(5);
  } else if (digits.startsWith("34115")) {
    digits = "341" + digits.slice(5);
  }

  // Si tiene 10 dígitos (ej: 2214923344), anteponer 549
  if (digits.length >= 10 && !digits.startsWith("54")) {
    return "549" + digits;
  }

  return digits.startsWith("54") ? digits : "549" + digits;
}

export type WhatsAppTemplateKey =
  | "recordatorio_mora"
  | "aviso_vencimiento"
  | "confirmacion_pago"
  | "datos_bancarios"
  | "consulta_general";

export interface WhatsAppMessageParams {
  destinatarioNombre?: string;
  estudianteNombre: string;
  cursoNombre?: string;
  concepto?: string;
  montoTotal?: number;
  reciboNumero?: string;
  fechaVencimiento?: string;
  metodoPago?: string;
}

/**
 * Genera textos institucionales profesionales para la Cultural Inglesa de Ensenada (EIS Institute)
 */
export function generateWhatsAppMessage(
  template: WhatsAppTemplateKey,
  params: WhatsAppMessageParams
): string {
  const tutorSaludo = params.destinatarioNombre
    ? `Estimado/a ${params.destinatarioNombre}`
    : `Estimada familia`;
  const alumnoMencion = `el/la estudiante ${params.estudianteNombre}`;
  const cursoMencion = params.cursoNombre ? ` (${params.cursoNombre})` : "";
  const conceptoMencion = params.concepto || "arancel mensual";
  const montoMencion = params.montoTotal ? formatCurrency(params.montoTotal) : "";
  const vencimientoMencion = params.fechaVencimiento ? formatDate(params.fechaVencimiento) : "la fecha";

  switch (template) {
    case "recordatorio_mora":
      return `Hola, ${tutorSaludo}.\nNos comunicamos desde la Secretaría de la *Cultural Inglesa de Ensenada (EIS Institute)* respecto a ${alumnoMencion}${cursoMencion}.\n\nLe informamos que registra una cuota vencida pendiente de cancelación correspondiente a *${conceptoMencion}* por un importe de *${montoMencion}*.\n\nPuede regularizar mediante:\n• *Transferencia bancaria* (Banco Provincia):\n  - CBU: 0140999801200018294812\n  - Alias: EIS.CULTURAL.BAPRO\n  - Titular: Cultural Inglesa de Ensenada\n• *Ventanilla de Secretaría*: Lunes a Viernes de 16:30 a 20:30 hs (Efectivo).\n\nSi ya efectuó el pago en las últimas horas, por favor remítanos el comprobante por este medio. ¡Muchas gracias!`;

    case "aviso_vencimiento":
      return `Hola, ${tutorSaludo}.\nNos comunicamos desde la Secretaría de *EIS Institute* para recordarle que el arancel de *${conceptoMencion}* correspondiente a ${alumnoMencion}${cursoMencion} por un importe de *${montoMencion}* tiene fecha límite el *${vencimientoMencion}*.\n\nRecuerde que abonando dentro del primer tramo mensual conserva la bonificación arancelaria en término.\n\nDatos de pago:\n- Alias BAPRO: EIS.CULTURAL.BAPRO\n- CBU: 0140999801200018294812\n\nQuedamos a disposición ante cualquier consulta. ¡Saludos cordiales!`;

    case "confirmacion_pago":
      return `Hola, ${tutorSaludo}.\nLe confirmamos que hemos registrado correctamente el cobro de *${conceptoMencion}* correspondiente a ${alumnoMencion}${cursoMencion}.\n\n🧾 *Recibo Oficial Nº*: ${params.reciboNumero || "S/N"}\n💰 *Importe percibido*: ${montoMencion}\n💳 *Medio*: ${params.metodoPago || "Registrado en caja"}\n\nEl comprobante ha quedado asentado en el sistema institucional. ¡Muchas gracias por mantener su cuota al día!\n_Secretaría · EIS Institute_`;

    case "datos_bancarios":
      return `Hola, ${tutorSaludo}.\nLe compartimos los datos bancarios oficiales de la *Cultural Inglesa de Ensenada (EIS Institute)* para el abono de aranceles:\n\n🏦 *Banco de la Provincia de Buenos Aires*\n• *Titular*: Cultural Inglesa de Ensenada\n• *CUIT*: 30-62981442-8\n• *Cuenta Corriente*: 014-099980/1\n• *CBU*: 0140999801200018294812\n• *Alias*: EIS.CULTURAL.BAPRO\n\n⚠️ *Importante*: Una vez efectuada la transferencia, por favor envíenos la captura del comprobante indicando nombre y DNI del alumno. ¡Muchas gracias!`;

    case "consulta_general":
    default:
      return `Hola, ${tutorSaludo}.\nNos comunicamos desde la Secretaría de la *Cultural Inglesa de Ensenada (EIS Institute)* para coordinar una consulta administrativa respecto a ${alumnoMencion}${cursoMencion}.\n\nQuedamos a su disposición.`;
  }
}

/**
 * Genera la URL para WhatsApp Web o app nativa
 */
export function buildWhatsAppLink(rawPhone: string, message: string): string {
  const cleanPhone = cleanArgentineWhatsAppNumber(rawPhone);
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
