"use client";

import React, { useState } from "react";
import { PostulanteItem } from "../types";
import { CursoOficial, ComisionCurso } from "@/features/cursos/types";
import { CURSOS_OFICIALES_EIS } from "@/features/cursos/mocks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Banknote,
  CreditCard,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CierreInscripcionMostradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteItem | null;
  cursos?: CursoOficial[];
  onConfirmarInscripcion: (
    postulanteId: string,
    cursoId: string,
    comisionId: string,
    medioCobro: "Efectivo" | "Transferencia",
    montoMatricula: number
  ) => void;
}

export const CierreInscripcionMostradorModal: React.FC<CierreInscripcionMostradorModalProps> = ({
  isOpen,
  onClose,
  postulante,
  cursos = CURSOS_OFICIALES_EIS,
  onConfirmarInscripcion,
}) => {
  if (!postulante) return null;

  // Determine course assigned or default
  const nivelNombre =
    postulante.resultadoCorreccion?.nivelAsignado || "JUNIORS 1";

  const matchingCurso =
    cursos.find((c) => c.nombre.toUpperCase() === nivelNombre.toUpperCase()) ||
    cursos[8];

  const [selectedComisionId, setSelectedComisionId] = useState<string>(
    matchingCurso.comisiones[0]?.id || ""
  );
  const [medioCobro, setMedioCobro] = useState<"Efectivo" | "Transferencia">("Efectivo");

  const montoMatricula =
    medioCobro === "Efectivo"
      ? matchingCurso.arancelEfectivoBase
      : matchingCurso.arancelTransferenciaBase;

  const handleConfirm = () => {
    onConfirmarInscripcion(
      postulante.id,
      matchingCurso.id,
      selectedComisionId,
      medioCobro,
      montoMatricula
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cierre de Inscripción en Mostrador (Admisiones)"
      subtitle={`Formalización de matrícula para ${postulante.nombreCompleto} (DNI ${postulante.dni})`}
      maxWidth="4xl"
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Banner Nivel Asignado y Carga Horaria */}
        <div className="p-4 rounded-xl bg-[#00205B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
              Dictamen Pedagógico de Dirección
            </span>
            <h3 className="text-xl font-black tracking-tight text-white mt-0.5">
              {matchingCurso.nombre}
            </h3>
            <span className="text-xs text-slate-300 block">
              {matchingCurso.categoria} · {matchingCurso.franjaEtariaRecomendada}
            </span>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E63956] text-white font-extrabold text-xs shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              {matchingCurso.cargaHorariaTexto}
            </span>
            <span className="text-[11px] text-slate-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {matchingCurso.examenAngliaAsociado}
            </span>
          </div>
        </div>

        {/* Control de Comisiones y Cupos en Tiempo Real */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#00205B]" />
            Seleccione Comisión y Horario con Vacante Disponible:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingCurso.comisiones.map((com) => {
              const vacantesLibres = com.cupoMaximo - com.cupoOcupado;
              const isSelected = selectedComisionId === com.id;

              return (
                <button
                  key={com.id}
                  type="button"
                  onClick={() => setSelectedComisionId(com.id)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-[#00205B] bg-blue-50/70 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[#00205B] text-xs">
                      {com.codigo} ({com.turno})
                    </span>
                    <Badge
                      variant={vacantesLibres > 3 ? "success" : "danger"}
                      size="sm"
                    >
                      {vacantesLibres} libres
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="text-slate-400">Horario:</span> {com.diasHorarios}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="text-slate-400">Profesor:</span> {com.profesorTitular}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuadro de Costos Aplicable (Efectivo vs. Transferencia) */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#00205B] text-xs flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Cuadro Arancelario y Cobro de Matrícula / 1º Cuota
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              Valores oficiales vigentes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMedioCobro("Efectivo")}
              className={`p-3 rounded-xl border text-left transition-all ${
                medioCobro === "Efectivo"
                  ? "border-emerald-600 bg-emerald-100/50 text-emerald-950 font-bold shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Efectivo en Ventanilla</span>
              </div>
              <span className="text-base font-black text-emerald-800 block mt-1">
                {formatCurrency(matchingCurso.arancelEfectivoBase)}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Días 1-10: {formatCurrency(matchingCurso.arancelEfectivoBase)} · Días 11-19:{" "}
                {formatCurrency(Math.round(matchingCurso.arancelEfectivoBase * 1.1))})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMedioCobro("Transferencia")}
              className={`p-3 rounded-xl border text-left transition-all ${
                medioCobro === "Transferencia"
                  ? "border-blue-600 bg-blue-100/50 text-blue-950 font-bold shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Transferencia Bancaria</span>
              </div>
              <span className="text-base font-black text-blue-800 block mt-1">
                {formatCurrency(matchingCurso.arancelTransferenciaBase)}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Días 1-10: {formatCurrency(matchingCurso.arancelTransferenciaBase)} · Días 11-19:{" "}
                {formatCurrency(Math.round(matchingCurso.arancelTransferenciaBase * 1.1))})
              </span>
            </button>
          </div>
        </div>

        {/* Libros de Texto Oficiales Requeridos */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#00205B]" />
            Libros de Texto y Materiales Exigidos para la Cursada:
          </span>
          <ul className="space-y-1 pl-1">
            {matchingCurso.librosMateriales.map((libro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{libro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            Al confirmar, el postulante pasa a <strong>&quot;Alumno Activo&quot;</strong>, se genera legajo y recibo en caja.
          </span>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto justify-center"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="coral"
              size="md"
              onClick={handleConfirm}
              className="font-bold shadow-md shadow-[#E63956]/20 w-full sm:w-auto justify-center"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirmar Vacante y Cobrar Matrícula
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
