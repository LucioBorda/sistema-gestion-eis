"use client";

import React from "react";
import { PostulanteItem, FranjaEtaria } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Printer, CheckCircle2, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TestOficialPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteItem | null;
  franjaEtariaOverride?: FranjaEtaria;
}

export const TestOficialPrintModal: React.FC<TestOficialPrintModalProps> = ({
  isOpen,
  onClose,
  postulante,
  franjaEtariaOverride,
}) => {
  if (!postulante) return null;

  const franja = franjaEtariaOverride || postulante.franjaEtaria || "Juniors";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Test Nivelatorio Oficial & Condiciones de Cursada"
      subtitle={`Formato oficial para impresión en papel · Franja: ${franja}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Printable Document Box */}
        <div
          id="test-imprimible"
          className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-slate-900 space-y-6 font-sans print:border-none print:p-0 text-xs"
        >
          {/* Header Membrete Oficial */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-[#00205B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00205B] text-white flex items-center justify-center font-black text-sm border-2 border-[#E63956]">
                EIS
              </div>
              <div>
                <h2 className="text-base font-black text-[#00205B] tracking-tight leading-none">
                  EIS INSTITUTE · CULTURAL INGLESA DE ENSENADA
                </h2>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  Evaluación Diagnóstica y Test Nivelatorio Oficial ({franja})
                </span>
                <span className="text-[10px] text-slate-400">
                  Calle La Paz Nº 525 · Ensenada (B1925) · Tel: (0221) 469-5201 · Anglia AR-ENS-084
                </span>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-2.5 text-center min-w-[130px] bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Calificación
              </span>
              <span className="text-sm font-black text-[#00205B] font-mono block my-1">
                _____ / 100
              </span>
              <span className="text-[9px] text-slate-500 font-semibold block">
                Nivel Asignado: _______
              </span>
            </div>
          </div>

          {/* Candidate Information Form Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Postulante:</span>
              <span className="font-bold text-slate-900 block">{postulante.nombreCompleto}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">DNI:</span>
              <span className="font-mono text-slate-800">{postulante.dni}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Edad / Franja:</span>
              <span className="text-slate-800">{postulante.edad} años ({franja})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha Evaluación:</span>
              <span className="text-slate-800 font-semibold">
                {postulante.fechaRegistro ? formatDate(postulante.fechaRegistro) : "18/10/2026"}
              </span>
            </div>
          </div>

          {/* EXAM CONTENT DEPENDING ON BRACKET */}
          <div className="space-y-4">
            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
              <span className="font-bold text-[#00205B] block">
                INSTRUCCIONES PARA EL ASPIRANTE:
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Complete de puño y letra utilizando bolígrafo azul o negro. Dispone de un tiempo máximo sugerido de 45 minutos. No está permitido el uso de dispositivos móviles o traductores electrónicos.
              </p>
            </div>

            {/* Section A: Grammar & Use of English */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs border-b pb-1">
                SECTION 1: USE OF ENGLISH & GRAMMAR ACCURACY
              </h4>

              {franja === "Children" ? (
                <div className="space-y-2 pl-2">
                  <p className="text-slate-700">
                    1. Look and circle the correct word:
                    <br />
                    <em>a) She ( have / has ) a green pencil case.</em>
                    <br />
                    <em>b) There ( is / are ) three apples on the table.</em>
                    <br />
                    <em>c) Yesterday I ( go / went ) to the park with my dog.</em>
                  </p>
                  <p className="text-slate-700">
                    2. Write the numbers in words:
                    <br />
                    <em>12 = ______________ · 25 = ______________ · 48 = ______________</em>
                  </p>
                </div>
              ) : franja === "Juniors" ? (
                <div className="space-y-2 pl-2">
                  <p className="text-slate-700">
                    1. Complete the sentences with the correct tense of the verbs in brackets:
                    <br />
                    <em>a) While I _________________ (study) for my exam, my brother arrived.</em>
                    <br />
                    <em>b) If it _________________ (rain) tomorrow, we won&apos;t play outside.</em>
                    <br />
                    <em>c) Have you ever _________________ (visit) London?</em>
                  </p>
                  <p className="text-slate-700">
                    2. Choose the correct option (A, B, or C):
                    <br />
                    <em>&quot;I didn&apos;t buy the jacket because it was __________ expensive.&quot; [ A) too | B) enough | C) much ]</em>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pl-2">
                  <p className="text-slate-700">
                    1. Rephrase the following sentences using the word given:
                    <br />
                    <em>a) We started living here five years ago. (FOR) &rarr; We ___________________________________ five years.</em>
                    <br />
                    <em>b) They will deliver the books next Monday. (BE) &rarr; The books _____________________________ next Monday.</em>
                    <br />
                    <em>c) &quot;I lost my passport yesterday,&quot; said Julian. (HE) &rarr; Julian said ____________________ the day before.</em>
                  </p>
                </div>
              )}
            </div>

            {/* Section B: Reading Comprehension & Writing Prompt */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs border-b pb-1">
                SECTION 2: READING COMPREHENSION & FREE WRITING PROMPT
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {franja === "Children"
                  ? "Draw and write 3 sentences about your favourite animal, what it eats and where it lives."
                  : franja === "Juniors"
                  ? "Write a short paragraph (50-70 words) describing an unforgettable holiday or school trip you took."
                  : "Write a short essay (80-120 words) explaining why learning English is essential for your personal or professional future in Argentina and abroad."}
              </p>
              <div className="w-full h-24 border border-dashed border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-400">
                [Espacio reglamentario para desarrollo manuscrito por parte del postulante]
              </div>
            </div>
          </div>

          {/* HOJA DE CONDICIONES DE CURSADA Y ADMISIÓN */}
          <div className="border-t-2 border-slate-800 pt-4 space-y-3 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-[#00205B] font-black text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#E63956]" />
              Hoja de Condiciones de Cursada, Plazos y Admisión Institucional
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  1. Plazos de Corrección:
                </span>
                La Dirección Pedagógica emitirá el dictamen de nivelación oficial en un plazo de <strong>24 a 48 hs hábiles</strong> (o en el momento ante mostrador si se encuentra la Directora presente).
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  2. Asistencia Mínima (80%):
                </span>
                Para conservar la regularidad y el derecho a ser presentado al examen internacional de <strong>Anglia Examinations</strong>, se exige un mínimo de <strong>80% de asistencia efectiva</strong> a clase.
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  3. Documentación Requerida:
                </span>
                Al confirmar la vacante en Secretaría presentar:
                <ul className="list-disc pl-3 text-[10px] mt-0.5 space-y-0.5">
                  <li>Fotocopia de DNI (ambos lados)</li>
                  <li>Certificado de apto médico escolar</li>
                  <li>2 fotografías tamaño 4x4</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500">
              <div>
                Firma y Aclaración del Postulante / Tutor: _________________________________
              </div>
              <div>
                Sello y Firma Secretaría EIS Institute: _________________________________
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Imprimir Examen Oficial (Ctrl + P)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
