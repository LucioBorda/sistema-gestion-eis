"use client";

import React, { useState } from "react";
import { PostulanteItem, ResultadoCorreccion } from "../types";
import { CursoOficial } from "@/features/cursos/types";
import { CURSOS_OFICIALES_EIS } from "@/features/cursos/mocks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Award, FileText, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

interface BandejaCorreccionDirectoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteItem | null;
  cursos?: CursoOficial[];
  onCalificarConfirm: (postulanteId: string, resultado: ResultadoCorreccion) => void;
}

export const BandejaCorreccionDirectoraModal: React.FC<BandejaCorreccionDirectoraModalProps> = ({
  isOpen,
  onClose,
  postulante,
  cursos = CURSOS_OFICIALES_EIS,
  onCalificarConfirm,
}) => {
  const [calificacion, setCalificacion] = useState("85/100 (Merit Distinction)");
  const [nivelAsignado, setNivelAsignado] = useState(cursos[8]?.nombre || "JUNIORS 1");
  const [observaciones, setObservaciones] = useState(
    "Nivel de comprensión auditiva acorde. Manejo adecuado de tiempos verbales. Asignar comisión con cupo disponible."
  );

  if (!postulante) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resultado: ResultadoCorreccion = {
      fechaCorreccion: new Date().toISOString().slice(0, 10),
      correctora: "Directora Lic. Patricia Cullen",
      calificacion,
      nivelAsignado,
      observaciones,
    };

    onCalificarConfirm(postulante.id, resultado);
    onClose();
  };

  const selectedCursoObj = cursos.find((c) => c.nombre === nivelAsignado);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bandeja de Corrección y Dictamen de Nivel (Dirección)"
      subtitle={`Evaluación pedagógica para ${postulante.nombreCompleto} (DNI ${postulante.dni})`}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        {/* Banner Exclusivo Directora */}
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E63956]" />
            <span className="font-bold">
              Panel Exclusivo de Dirección General · Aprobación de Nivel Oficial
            </span>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded font-mono font-bold text-slate-700 border border-rose-200">
            Postulante #{postulante.id}
          </span>
        </div>

        {/* Grid: Exam scan on the left, grading form on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Scan Preview */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#00205B]" />
              Examen Físico Digitalizado:
            </span>

            {postulante.examenDigitalizado ? (
              <div className="space-y-2">
                <img
                  src={postulante.examenDigitalizado.imagenUrl}
                  alt="Escaneo Examen Físico"
                  className="w-full h-56 object-cover rounded-lg border border-slate-300 shadow-2xs cursor-zoom-in"
                  onClick={() => window.open(postulante.examenDigitalizado?.imagenUrl, "_blank")}
                />
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{postulante.examenDigitalizado.nombreArchivo}</span>
                  <span>{postulante.examenDigitalizado.paginasCount} páginas</span>
                </div>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
                <FileText className="w-8 h-8 mb-1" />
                <span>Examen rendido de forma manuscrita</span>
              </div>
            )}
          </div>

          {/* Right: Grading Form */}
          <div className="space-y-3">
            <Input
              label="Calificación Oficial Obtenida (Puntaje / Rúbrica)"
              value={calificacion}
              onChange={(e) => setCalificacion(e.target.value)}
              placeholder="ej: 92/100 (Pass with Honours)"
              required
            />

            <Select
              label="Nivel Oficial Dictaminado (Catálogo de 19 Cursos)"
              value={nivelAsignado}
              onChange={(e) => setNivelAsignado(e.target.value)}
              options={cursos.map((c) => ({
                value: c.nombre,
                label: `${c.numeroOrden}. ${c.nombre} (${c.cargaHorariaTexto} - ${c.categoria})`,
              }))}
            />

            {selectedCursoObj && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>Carga Horaria Semanal:</span>
                  <span className="flex items-center gap-1 text-[#E63956]">
                    <Clock className="w-3 h-3" />
                    {selectedCursoObj.cargaHorariaTexto}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Certificación Anglia Asociada:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCursoObj.examenAngliaAsociado}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observaciones Pedagógicas y Recomendación de Comisión
              </label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            Al confirmar, el alumno pasa automáticamente a <strong>&quot;Pre-Alumno&quot;</strong>, listo para inscripción en mostrador.
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
              type="submit"
              variant="coral"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center font-bold"
            >
              Confirmar Dictamen de Nivel
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
