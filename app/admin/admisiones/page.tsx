"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import {
  PostulanteItem,
  EstadoPostulante,
  ExamenDigitalizado,
  ResultadoCorreccion,
  FranjaEtaria,
} from "@/features/admisiones/types";
import { INITIAL_POSTULANTES } from "@/features/admisiones/mocks";
import { PostulanteModal } from "@/features/admisiones/components/PostulanteModal";
import { TestOficialPrintModal } from "@/features/admisiones/components/TestOficialPrintModal";
import { ExamenUploadModal } from "@/features/admisiones/components/ExamenUploadModal";
import { BandejaCorreccionDirectoraModal } from "@/features/admisiones/components/BandejaCorreccionDirectoraModal";
import { CierreInscripcionMostradorModal } from "@/features/admisiones/components/CierreInscripcionMostradorModal";
import { CalendarioEvaluaciones } from "@/features/admisiones/components/CalendarioEvaluaciones";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  UserPlus,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function AdmisionesPage(): React.ReactElement {
  const {
    postulantes = INITIAL_POSTULANTES,
    addPostulante,
    subirExamenFisico,
    corregirTestDirectora,
    inscribirPreAlumno,
    cursos,
  } = useGlobalData();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [showCalendar, setShowCalendar] = useState(false);

  // Modals state
  const [modalPostulanteOpen, setModalPostulanteOpen] = useState(false);
  const [modalPrintOpen, setModalPrintOpen] = useState(false);
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [modalCorrectionOpen, setModalCorrectionOpen] = useState(false);
  const [modalEnrollOpen, setModalEnrollOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedPostulante, setSelectedPostulante] = useState<PostulanteItem | null>(null);

  // Funnel KPIs - Excluimos a los alumnos que ya han sido matriculados (Alumnos Activos)
  const postulantesEnProceso = postulantes.filter((p) => p.estado !== "Alumno Activo");
  const totalLeads = postulantesEnProceso.length;
  const testPendientes = postulantesEnProceso.filter(
    (p) => p.estado === "Test Pendiente" || p.estado === "Postulante"
  ).length;
  const enCorreccionCount = postulantesEnProceso.filter(
    (p) => p.estado === "Test en Corrección"
  ).length;
  const preAlumnosCount = postulantesEnProceso.filter((p) => p.estado === "Pre-Alumno").length;

  const filteredPostulantes =
    filterEstado === "TODOS"
      ? postulantesEnProceso
      : postulantesEnProceso.filter((p) => p.estado === filterEstado);

  // Actions handlers
  const handleOpenNewPostulante = () => {
    setModalPostulanteOpen(true);
  };

  const handleSavePostulante = (postulante: PostulanteItem, imprimirInmediato: boolean) => {
    addPostulante(postulante);
    setModalPostulanteOpen(false);
    if (imprimirInmediato) {
      setSelectedPostulante(postulante);
      setModalPrintOpen(true);
    }
  };

  const handleOpenPrintTest = (item: PostulanteItem) => {
    setSelectedPostulante(item);
    setModalPrintOpen(true);
  };

  const handleOpenUploadExam = (item: PostulanteItem) => {
    setSelectedPostulante(item);
    setModalUploadOpen(true);
  };

  const handleConfirmUpload = (postulanteId: string, examen: ExamenDigitalizado) => {
    subirExamenFisico(postulanteId, examen);
    setModalUploadOpen(false);
  };

  const handleOpenCorrection = (item: PostulanteItem) => {
    setSelectedPostulante(item);
    setModalCorrectionOpen(true);
  };

  const handleConfirmCorrection = (postulanteId: string, resultado: ResultadoCorreccion) => {
    corregirTestDirectora(postulanteId, resultado);
    setModalCorrectionOpen(false);
  };

  const handleOpenEnrollDesk = (item: PostulanteItem) => {
    router.push(`/admin/inscripciones?postulanteId=${item.id}&action=matricular`);
  };

  const handleConfirmEnroll = (
    postulanteId: string,
    cursoId: string,
    comisionId: string,
    medioCobro: "Efectivo" | "Transferencia",
    montoMatricula: number
  ) => {
    inscribirPreAlumno(postulanteId, cursoId, comisionId, medioCobro, montoMatricula);
    setModalEnrollOpen(false);
  };

  const handleOpenDetail = (item: PostulanteItem) => {
    setSelectedPostulante(item);
    setDetailModalOpen(true);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "padron_admisiones_funnel_eis",
      [
        { header: "Postulante", accessor: "nombreCompleto" },
        { header: "DNI", accessor: "dni" },
        { header: "Teléfono", accessor: "telefono" },
        { header: "Edad", accessor: "edad" },
        { header: "Franja", accessor: "franjaEtaria" },
        { header: "Estado Funnel", accessor: "estado" },
        { header: "Modalidad", accessor: "modalidadRinde" },
        {
          header: "Nivel Asignado",
          accessor: (p) => p.resultadoCorreccion?.nivelAsignado || "-",
        },
      ],
      filteredPostulantes
    );
  };

  const columns: ColumnDef<PostulanteItem>[] = [
    {
      id: "postulante",
      header: "Aspirante / Contacto",
      accessorKey: "nombreCompleto",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-extrabold text-slate-900 block text-xs">
            {item.nombreCompleto}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            DNI {item.dni} · {item.telefono}
          </span>
        </div>
      ),
    },
    {
      id: "edad",
      header: "Edad / Franja",
      cell: (item) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800">{item.edad} años</span>
          <Badge
            variant={
              item.franjaEtaria === "Children"
                ? "info"
                : item.franjaEtaria === "Juniors"
                ? "navy"
                : "warning"
            }
            size="sm"
            className="ml-2"
          >
            {item.franjaEtaria}
          </Badge>
        </div>
      ),
    },
    {
      id: "modalidad",
      header: "Modalidad Test",
      cell: (item) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-700 block">
            {item.modalidadRinde}
          </span>
          {item.fechaAgendadaTest && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E63956]" />
              {item.fechaAgendadaTest} · {item.horaAgendadaTest || "18:00"}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "dictamen",
      header: "Dictamen Pedagógico",
      cell: (item) => (
        <div className="text-xs">
          {item.resultadoCorreccion ? (
            <div>
              <span className="font-bold text-[#00205B] block">
                {item.resultadoCorreccion.nivelAsignado}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {item.resultadoCorreccion.calificacion}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-xs">Pendiente de evaluación</span>
          )}
        </div>
      ),
    },
    {
      id: "estado",
      header: "Estado en el Funnel",
      cell: (item) => (
        <Badge
          variant={
            item.estado === "Alumno Activo"
              ? "success"
              : item.estado === "Pre-Alumno"
              ? "info"
              : item.estado === "Test en Corrección"
              ? "coral"
              : item.estado === "Test Pendiente"
              ? "warning"
              : "default"
          }
          size="sm"
        >
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E63956] text-xs font-bold border border-rose-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Admisiones & Ciclo del Estudiante (State Machine)
          </div>
          <h1 className="text-xl font-black text-[#00205B] tracking-tight">
            Circuito Operativo del Test Nivelatorio y Admisiones
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Desde la precarga de leads hasta la toma presencial, digitalización del examen físico, dictamen de la Directora y cierre de matrícula en mostrador.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            icon={<Calendar className="w-4 h-4 text-[#00205B]" />}
          >
            {showCalendar ? "Ocultar Agenda" : "Ver Calendario"}
          </Button>
        </div>
      </div>

      {/* 4 Funnel KPI Progress Blocks (Aspirantes en circuito) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1. Total Aspirantes
          </span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">
            {totalLeads}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Aspirantes en proceso
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            2. Tests Pendientes
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {testPendientes}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Por rendir o agendados
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/40 shadow-2xs">
          <span className="text-[10px] font-bold text-[#E63956] uppercase tracking-wider block">
            3. Bandeja Directora
          </span>
          <span className="text-2xl font-black text-[#E63956] mt-1 block">
            {enCorreccionCount}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-semibold">
            Exámenes en corrección
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-[10px] font-bold text-[#00205B] uppercase tracking-wider block">
            4. Pre-Alumnos
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">
            {preAlumnosCount}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
            Listos p/ matricular
          </span>
        </div>
      </div>

      {/* Calendario de Evaluaciones Colapsable */}
      {showCalendar && (
        <CalendarioEvaluaciones
          postulantes={postulantes}
          onTomarTestAhora={handleOpenPrintTest}
          onSubirExamen={handleOpenUploadExam}
        />
      )}

      {/* Main Table with Stage Filters */}
      <DataTable
        title="Padrón de Admisiones y Estado del Test"
        subtitle="Monitoreo paso a paso del embudo de ingreso de aspirantes (los alumnos matriculados pasan a Matriculaciones)"
        data={filteredPostulantes}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNewPostulante}
        addNewLabel="Nuevo Postulante"
        onExportExcel={handleExportExcel}
        onView={handleOpenDetail}
        initialPageSize={8}
        extraFilters={
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            {[
              "TODOS",
              "Postulante",
              "Test Pendiente",
              "Test en Corrección",
              "Pre-Alumno",
            ].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterEstado(st)}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  filterEstado === st
                    ? "bg-[#00205B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
        customRowActions={(item) => (
          <div className="flex items-center gap-1">
            {/* Action 1: Print Official Test */}
            {(item.estado === "Postulante" || item.estado === "Test Pendiente") && (
              <>
                <button
                  onClick={() => handleOpenPrintTest(item)}
                  title="Imprimir Test Nivelatorio y Hoja de Condiciones"
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Test</span>
                </button>
                <button
                  onClick={() => handleOpenUploadExam(item)}
                  title="Digitalizar y Subir Examen Rendido"
                  className="px-2 py-1 rounded-lg bg-blue-50 text-[#00205B] hover:bg-blue-100 font-bold text-xs flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir</span>
                </button>
              </>
            )}

            {/* Action 2: Directora Correction */}
            {item.estado === "Test en Corrección" && (
              <button
                onClick={() => handleOpenCorrection(item)}
                title="Bandeja Directora: Corregir y Asignar Nivel"
                className="px-2.5 py-1 rounded-lg bg-rose-50 text-[#E63956] hover:bg-rose-100 font-bold text-xs flex items-center gap-1 border border-rose-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Corregir</span>
              </button>
            )}

            {/* Action 3: Desk Enrollment Closure */}
            {item.estado === "Pre-Alumno" && (
              <button
                onClick={() => handleOpenEnrollDesk(item)}
                title="Cierre de Inscripción en Mostrador"
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 border border-emerald-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Matricular</span>
              </button>
            )}
          </div>
        )}
      />

      {/* MODAL 1: PRECARGA RÁPIDA DE POSTULANTE */}
      <PostulanteModal
        isOpen={modalPostulanteOpen}
        onClose={() => setModalPostulanteOpen(false)}
        onSave={handleSavePostulante}
      />

      {/* MODAL 2: IMPRIMIR TEST OFICIAL Y HOJA DE CONDICIONES */}
      <TestOficialPrintModal
        isOpen={modalPrintOpen}
        onClose={() => setModalPrintOpen(false)}
        postulante={selectedPostulante}
      />

      {/* MODAL 3: SUBIR EXAMEN FÍSICO DIGITALIZADO */}
      <ExamenUploadModal
        isOpen={modalUploadOpen}
        onClose={() => setModalUploadOpen(false)}
        postulante={selectedPostulante}
        onUploadConfirm={handleConfirmUpload}
      />

      {/* MODAL 4: BANDEJA DE CORRECCIÓN DE LA DIRECTORA */}
      <BandejaCorreccionDirectoraModal
        isOpen={modalCorrectionOpen}
        onClose={() => setModalCorrectionOpen(false)}
        postulante={selectedPostulante}
        cursos={cursos}
        onCalificarConfirm={handleConfirmCorrection}
      />

      {/* MODAL 5: CIERRE DE INSCRIPCIÓN EN MOSTRADOR */}
      <CierreInscripcionMostradorModal
        isOpen={modalEnrollOpen}
        onClose={() => setModalEnrollOpen(false)}
        postulante={selectedPostulante}
        cursos={cursos}
        onConfirmarInscripcion={handleConfirmEnroll}
      />

      {/* MODAL 6: VER DETALLE DEL POSTULANTE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedPostulante?.nombreCompleto || "Ficha del Aspirante"}
        maxWidth="md"
      >
        {selectedPostulante && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Postulante:</span>
                <span className="font-bold text-slate-900">{selectedPostulante.nombreCompleto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-mono">{selectedPostulante.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Edad / Franja:</span>
                <span>{selectedPostulante.edad} años ({selectedPostulante.franjaEtaria})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span>{selectedPostulante.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span>{selectedPostulante.email || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado en Funnel:</span>
                <Badge variant="navy" size="sm">
                  {selectedPostulante.estado}
                </Badge>
              </div>
              {selectedPostulante.resultadoCorreccion && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between font-bold text-[#00205B]">
                    <span>Nivel Dictaminado:</span>
                    <span>{selectedPostulante.resultadoCorreccion.nivelAsignado}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Puntaje:</span>
                    <span>{selectedPostulante.resultadoCorreccion.calificacion}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
