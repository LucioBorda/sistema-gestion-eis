"use client";

import React from "react";
import { PostulanteItem } from "../types";
import { Calendar, Clock, User, Phone, CheckCircle2, FileText, ArrowRight } from "lucide-react";
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
  const agendados = postulantes.filter(
    (p) => p.modalidadRinde === "Fecha futura" && p.fechaAgendadaTest
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00205B] flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Calendario de Evaluaciones Nivelatorias Agendadas
            </h3>
            <span className="text-[11px] text-slate-500">
              Agenda de turnos para toma de tests en sede central La Paz Nº 525
            </span>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {agendados.length} turnos agendados
        </span>
      </div>

      {agendados.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No hay evaluaciones agendadas para fechas futuras.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agendados.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00205B]">
                    <Clock className="w-3.5 h-3.5 text-[#E63956]" />
                    <span>
                      {item.fechaAgendadaTest} · {item.horaAgendadaTest || "18:00"} hs
                    </span>
                  </div>
                  <Badge
                    variant={item.franjaEtaria === "Children" ? "info" : item.franjaEtaria === "Juniors" ? "navy" : "warning"}
                    size="sm"
                  >
                    {item.franjaEtaria}
                  </Badge>
                </div>

                <h4 className="font-bold text-xs text-slate-900">{item.nombreCompleto}</h4>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  DNI {item.dni} · {item.edad} años
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{item.telefono}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onTomarTestAhora(item)}
                  className="font-bold text-[#00205B] hover:text-[#E63956] transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Imprimir Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSubirExamen(item)}
                  className="px-2 py-1 rounded bg-[#00205B] text-white hover:bg-blue-900 font-bold text-[10px] transition-colors"
                >
                  Subir Escaneo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
