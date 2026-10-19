"use client";

import React, { useState } from "react";
import { PostulanteItem } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Printer,
  Upload,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CalendarioEvaluacionesProps {
  postulantes: PostulanteItem[];
  onTomarTestAhora: (postulante: PostulanteItem) => void;
  onSubirExamen: (postulante: PostulanteItem) => void;
}

export const CalendarioEvaluaciones: React.FC<CalendarioEvaluacionesProps> = ({
  postulantes,
  onTomarTestAhora,
  onSubirExamen,
}) => {
  // Calendar month state (defaults to October 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = Octubre
  const [selectedPostulante, setSelectedPostulante] = useState<PostulanteItem | null>(null);

  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Filter postulantes scheduled with future date
  const agendados = postulantes.filter(
    (p) => p.modalidadRinde === "Fecha futura" && p.fechaAgendadaTest
  );

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // Octubre
  };

  // Compute days in month and padding
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map events by day number (e.g. 21 -> PostulanteItem[])
  const eventsByDay = React.useMemo(() => {
    const map: Record<number, PostulanteItem[]> = {};
    agendados.forEach((p) => {
      if (!p.fechaAgendadaTest) return;
      const parts = p.fechaAgendadaTest.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (year === currentYear && month === currentMonth) {
          if (!map[day]) map[day] = [];
          map[day].push(p);
        }
      }
    });
    return map;
  }, [agendados, currentYear, currentMonth]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
      {/* Google Calendar Style Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center font-black">
            <CalendarDays className="w-5 h-5 text-[#00205B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#00205B] tracking-tight">
                {mesesNombres[currentMonth]} {currentYear}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#00205B] text-xs font-bold border border-blue-200">
                {agendados.length} evaluaciones
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Agenda de turnos para evaluación nivelatoria presencial en sede
            </span>
          </div>
        </div>

        {/* Navigation Controls like Google Calendar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            Hoy
          </button>
          <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mes Anterior"
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              title="Mes Siguiente"
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Google Calendar Monthly Grid */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2.5">
          {diasSemana.map((dia, idx) => (
            <div
              key={dia}
              className={idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-700"}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Calendar days grid (7 cols) */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[360px]">
          {/* Leading blank days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="bg-slate-50/40 p-2 min-h-[85px]" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayEvents = eventsByDay[dayNum] || [];
            const isToday = currentYear === 2026 && currentMonth === 9 && dayNum === 18;

            return (
              <div
                key={`day-${dayNum}`}
                className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
                  isToday ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-[#00205B] text-white shadow-xs"
                        : "text-slate-700"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-[#E63956]">
                      {dayEvents.length} {dayEvents.length === 1 ? "turno" : "turnos"}
                    </span>
                  )}
                </div>

                {/* Event Chips (Google Calendar Style) */}
                <div className="space-y-1 mt-1 flex-1">
                  {dayEvents.map((ev) => {
                    const isSelected = selectedPostulante?.id === ev.id;
                    const isChildren = ev.franjaEtaria === "Children";
                    const isJuniors = ev.franjaEtaria === "Juniors";

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedPostulante(ev)}
                        className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-bold truncate transition-all flex items-center gap-1 ${
                          isSelected
                            ? "ring-2 ring-[#00205B] shadow-xs"
                            : ""
                        } ${
                          isChildren
                            ? "bg-purple-100 text-purple-900 hover:bg-purple-200"
                            : isJuniors
                            ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                            : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        }`}
                        title={`${ev.horaAgendadaTest || "18:00"} - ${ev.nombreCompleto} (${ev.franjaEtaria})`}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        <span className="font-mono text-[10px]">
                          {ev.horaAgendadaTest || "18:00"}
                        </span>
                        <span className="truncate">{ev.nombreCompleto.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Floating Details Card (Google Calendar Details Style) */}
      {selectedPostulante && (
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 animate-in fade-in duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Turno Seleccionado en Calendario:
              </span>
              <Badge
                variant={
                  selectedPostulante.franjaEtaria === "Children"
                    ? "info"
                    : selectedPostulante.franjaEtaria === "Juniors"
                    ? "navy"
                    : "warning"
                }
                size="sm"
              >
                {selectedPostulante.franjaEtaria} ({selectedPostulante.edad} años)
              </Badge>
            </div>
            <h4 className="text-base font-black text-slate-900">
              {selectedPostulante.nombreCompleto}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-mono font-bold text-[#00205B]">
                <Clock className="w-3.5 h-3.5 text-[#E63956]" />
                {selectedPostulante.fechaAgendadaTest} · {selectedPostulante.horaAgendadaTest || "18:00"} hs
              </span>
              <span>·</span>
              <span className="font-mono">DNI {selectedPostulante.dni}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {selectedPostulante.telefono}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTomarTestAhora(selectedPostulante)}
              icon={<Printer className="w-4 h-4 text-[#00205B]" />}
            >
              Imprimir Test Oficial
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSubirExamen(selectedPostulante)}
              icon={<Upload className="w-4 h-4" />}
            >
              Subir Examen Escaneado
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPostulante(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
