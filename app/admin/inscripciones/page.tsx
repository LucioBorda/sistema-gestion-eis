"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalData } from "@/features/core/DataContext";
import { InscripcionItem } from "@/features/inscripciones/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  GraduationCap,
  UserCheck,
  Banknote,
  CreditCard,
  Sparkles,
  Info,
} from "lucide-react";

// Escala de Aranceles de Matrícula por Mes fijada por la Administración Escolar
const ESCALA_MESES_MATRICULA = [
  { value: "septiembre", label: "Septiembre (Matrícula Temprana) — $30.000", monto: 30000 },
  { value: "octubre", label: "Octubre (Matrícula Regular) — $35.000", monto: 35000 },
  { value: "noviembre", label: "Noviembre (Matrícula Escalonada) — $38.000", monto: 38000 },
  { value: "diciembre", label: "Diciembre (Cierre de Año) — $40.000", monto: 40000 },
  { value: "febrero", label: "Febrero / Marzo (Inicio de Ciclo) — $45.000", monto: 45000 },
  { value: "personalizado", label: "Arancel Personalizado (Fijado por Administración)", monto: 0 },
];

function InscripcionesContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postulanteIdParam = searchParams.get("postulanteId");
  const actionParam = searchParams.get("action");

  const {
    inscripciones,
    estudiantes,
    comisiones,
    ciclosLectivos,
    postulantes,
    cursos,
    addInscripcion,
    updateInscripcion,
    deleteInscripcion,
    inscribirPreAlumno,
  } = useGlobalData();

  // Dialogs & Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [postulanteModalOpen, setPostulanteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const [selectedIns, setSelectedIns] = useState<InscripcionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State: Regular Matriculación
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [comisionId, setComisionId] = useState(comisiones[0]?.id || "");
  const [cicloLectivo, setCicloLectivo] = useState("Ciclo Lectivo 2026");
  const [mesPagoSeleccionado, setMesPagoSeleccionado] = useState("octubre");
  const [arancelMatricula, setArancelMatricula] = useState(35000);
  const [metodoPago, setMetodoPago] = useState<InscripcionItem["metodoPago"]>("Transferencia");
  const [estado, setEstado] = useState<InscripcionItem["estado"]>("Confirmada");
  const [observaciones, setObservaciones] = useState("");

  // Postulante Matriculación Form State
  const targetPostulante = postulanteIdParam
    ? postulantes.find((p) => p.id === postulanteIdParam) || null
    : null;

  const [postComisionId, setPostComisionId] = useState(comisiones[0]?.id || "");
  const [postMesPago, setPostMesPago] = useState("octubre");
  const [postArancel, setPostArancel] = useState(35000);
  const [postMetodoPago, setPostMetodoPago] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [postObservaciones, setPostObservaciones] = useState("");

  // Auto-open modal if navigating from Admisiones to matricular an applicant
  useEffect(() => {
    if (actionParam === "matricular" && targetPostulante) {
      // Find matching comision for assigned level if possible
      const assignedLevel = targetPostulante.resultadoCorreccion?.nivelAsignado || "";
      const matchingComision = comisiones.find((c) =>
        c.nombre.toLowerCase().includes(assignedLevel.toLowerCase().slice(0, 6))
      );
      if (matchingComision) {
        setPostComisionId(matchingComision.id);
      } else if (comisiones[0]) {
        setPostComisionId(comisiones[0].id);
      }

      setPostMesPago("octubre");
      setPostArancel(35000);
      setPostMetodoPago("Efectivo");
      setPostObservaciones(
        `Matrícula 2026 tras Test Nivelatorio aprobado. Nivel asignado: ${assignedLevel || "General"}.`
      );
      setPostulanteModalOpen(true);
    }
  }, [actionParam, targetPostulante?.id]);

  // Handle month selection change for regular form
  const handleMesChange = (mesVal: string) => {
    setMesPagoSeleccionado(mesVal);
    const escala = ESCALA_MESES_MATRICULA.find((e) => e.value === mesVal);
    if (escala && escala.monto > 0) {
      setArancelMatricula(escala.monto);
    }
  };

  // Handle month selection change for postulante form
  const handlePostMesChange = (mesVal: string) => {
    setPostMesPago(mesVal);
    const escala = ESCALA_MESES_MATRICULA.find((e) => e.value === mesVal);
    if (escala && escala.monto > 0) {
      setPostArancel(escala.monto);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedIns(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setComisionId(comisiones[0]?.id || "");
    setCicloLectivo("Ciclo Lectivo 2026");
    setMesPagoSeleccionado("octubre");
    setArancelMatricula(35000);
    setMetodoPago("Transferencia");
    setEstado("Confirmada");
    setObservaciones("Matrícula anual regular asentada en secretaría.");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InscripcionItem) => {
    setIsEditing(true);
    setSelectedIns(item);
    setEstudianteId(item.estudianteId);
    setComisionId(item.comisionId);
    setCicloLectivo(item.cicloLectivo);
    setMesPagoSeleccionado("personalizado");
    setArancelMatricula(item.arancelMatricula);
    setMetodoPago(item.metodoPago);
    setEstado(item.estado);
    setObservaciones(item.observaciones);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: InscripcionItem) => {
    setSelectedIns(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: InscripcionItem) => {
    setSelectedIns(item);
    setConfirmDeleteOpen(true);
  };

  const selectedComisionObj = comisiones.find((c) => c.id === comisionId);
  const isCupoFull = selectedComisionObj
    ? selectedComisionObj.cupoOcupado >= selectedComisionObj.cupoMaximo
    : false;

  const postSelectedComisionObj = comisiones.find((c) => c.id === postComisionId);

  // Save Regular Matriculación
  const handleSaveRegular = (e: React.FormEvent) => {
    e.preventDefault();
    const estObj = estudiantes.find((e) => e.id === estudianteId);
    const comObj = comisiones.find((c) => c.id === comisionId);

    const estudianteNombre = estObj ? estObj.nombreCompleto : "Alumno";
    const estudianteDni = estObj ? estObj.dni : "00000000";
    const comisionNombre = comObj ? comObj.nombre : "Comisión";

    if (isEditing && selectedIns) {
      updateInscripcion({
        ...selectedIns,
        estudianteId,
        estudianteNombre,
        estudianteDni,
        comisionId,
        comisionNombre,
        cicloLectivo,
        arancelMatricula,
        metodoPago,
        estado,
        observaciones,
      });
    } else {
      const numeroMatricula = `MATR-2026-${String(inscripciones.length + 1).padStart(3, "0")}`;
      const newIns: InscripcionItem = {
        id: `ins-${Date.now()}`,
        numeroMatricula,
        estudianteId,
        estudianteNombre,
        estudianteDni,
        comisionId,
        comisionNombre,
        cicloLectivo,
        fechaMatriculacion: new Date().toISOString().slice(0, 10),
        arancelMatricula,
        metodoPago,
        estado,
        observaciones,
      };
      addInscripcion(newIns);
    }
    setModalOpen(false);
    setSuccessNotification(`Matrícula asentada exitosamente con valor de ${formatCurrency(arancelMatricula)}.`);
  };

  // Confirm Postulante Matriculación
  const handleConfirmPostulanteEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPostulante) return;

    // Pick matching curso or fallback
    const matchedCurso = cursos[0]?.id || "cur-1";

    inscribirPreAlumno(
      targetPostulante.id,
      matchedCurso,
      postComisionId,
      postMetodoPago,
      postArancel
    );

    setPostulanteModalOpen(false);
    setSuccessNotification(
      `¡Matrícula confirmada! El aspirante ${targetPostulante.nombreCompleto} ha sido incorporado al padrón oficial de alumnos con arancel de ${formatCurrency(postArancel)} (Sin mora).`
    );

    // Clean URL query parameters
    router.replace("/admin/inscripciones");
  };

  const handleConfirmDelete = () => {
    if (selectedIns) {
      deleteInscripcion(selectedIns.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "matriculas_inscripciones_eis",
      [
        { header: "Matrícula Nº", accessor: "numeroMatricula" },
        { header: "Estudiante", accessor: "estudianteNombre" },
        { header: "DNI", accessor: "estudianteDni" },
        { header: "Comisión Asignada", accessor: "comisionNombre" },
        { header: "Ciclo Lectivo", accessor: "cicloLectivo" },
        { header: "Fecha", accessor: (i) => formatDate(i.fechaMatriculacion) },
        { header: "Arancel Matrícula", accessor: (i) => formatCurrency(i.arancelMatricula) },
        { header: "Método de Pago", accessor: "metodoPago" },
        { header: "Estado", accessor: "estado" },
      ],
      inscripciones
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Libro de Matrículas e Inscripciones Oficiales - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Estudiante</th>
            <th>DNI</th>
            <th>Comisión</th>
            <th>Fecha</th>
            <th>Arancel</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${inscripciones
            .map(
              (i) => `
            <tr>
              <td><strong>${i.numeroMatricula}</strong></td>
              <td>${i.estudianteNombre}</td>
              <td>${i.estudianteDni}</td>
              <td>${i.comisionNombre}</td>
              <td>${formatDate(i.fechaMatriculacion)}</td>
              <td>${formatCurrency(i.arancelMatricula)} (${i.metodoPago})</td>
              <td>${i.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Libro de Matrículas Institucionales", htmlBody);
  };

  const columns: ColumnDef<InscripcionItem>[] = [
    {
      id: "matricula",
      header: "Nº Matrícula",
      accessorKey: "numeroMatricula",
      sortable: true,
      className: "w-32 font-bold text-[#00205B]",
    },
    {
      id: "estudiante",
      header: "Estudiante",
      accessorKey: "estudianteNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.estudianteNombre}</span>
          <span className="text-[11px] font-mono text-slate-500">DNI {item.estudianteDni}</span>
        </div>
      ),
    },
    {
      id: "comision",
      header: "Comisión / Ciclo",
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            {item.comisionNombre}
          </span>
          <span className="text-[11px] text-slate-400">{item.cicloLectivo}</span>
        </div>
      ),
    },
    {
      id: "arancel",
      header: "Arancel Matrícula",
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {formatCurrency(item.arancelMatricula)}
          </span>
          <span className="text-[11px] text-slate-500">{item.metodoPago}</span>
        </div>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: (item) => (
        <span className="text-xs text-slate-600">{formatDate(item.fechaMatriculacion)}</span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge
          variant={
            item.estado === "Confirmada"
              ? "success"
              : item.estado === "Pendiente"
              ? "warning"
              : "danger"
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
      {/* Success Notification Banner */}
      {successNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline ml-4"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Target Postulante Matriculation Banner if coming from Admissions */}
      {targetPostulante && (
        <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#00205B] text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              Pase a Matrícula Activo desde Admisiones
            </div>
            <h3 className="text-base font-black text-[#00205B]">
              Aspirante Evaluado: {targetPostulante.nombreCompleto} (DNI {targetPostulante.dni})
            </h3>
            <p className="text-xs text-slate-600">
              Nivel asignado por Directora:{" "}
              <strong className="text-slate-900 font-bold">
                {targetPostulante.resultadoCorreccion?.nivelAsignado || "Sin dictamen"}
              </strong>{" "}
              · Calificación:{" "}
              <span className="text-emerald-700 font-bold">
                {targetPostulante.resultadoCorreccion?.calificacion || "Pendiente"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="coral"
              size="sm"
              onClick={() => setPostulanteModalOpen(true)}
              icon={<GraduationCap className="w-4 h-4" />}
            >
              Completar Matriculación
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.replace("/admin/inscripciones")}
              className="text-slate-500 hover:text-slate-700"
            >
              Ignorar
            </Button>
          </div>
        </div>
      )}

      <DataTable
        title="Libro de Inscripciones y Matriculaciones"
        subtitle="Control de altas de matrícula por ciclo lectivo con esquema de aranceles escalonados según mes fijado por la administración (sin recargos por mora)"
        data={inscripciones}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nueva Matrícula"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        initialPageSize={8}
      />

      {/* MODAL 1: MATRICULACIÓN OFICIAL DE ASPIRANTE EVALUADO (FROM ADMISSION DESK) */}
      <Modal
        isOpen={postulanteModalOpen}
        onClose={() => setPostulanteModalOpen(false)}
        title="Matriculación y Cobro de Aspirante Evaluado"
        subtitle="Cierre formal de ingreso tras test de nivel, asignación de comisión y cobro según mes sin mora"
        maxWidth="lg"
      >
        {targetPostulante && (
          <form onSubmit={handleConfirmPostulanteEnroll} className="space-y-4 py-2">
            {/* Applicant Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#00205B] text-sm">
                  {targetPostulante.nombreCompleto}
                </span>
                <Badge variant="navy" size="sm">
                  {targetPostulante.franjaEtaria} ({targetPostulante.edad} años)
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[11px]">DNI:</span>
                  <span className="font-mono font-bold text-slate-800">{targetPostulante.dni}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Teléfono:</span>
                  <span className="font-semibold text-slate-800">{targetPostulante.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dictamen Pedagógico:</span>
                  <span className="font-bold text-[#00205B]">
                    {targetPostulante.resultadoCorreccion?.nivelAsignado || "Nivel General"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Calificación:</span>
                  <span className="font-bold text-emerald-700">
                    {targetPostulante.resultadoCorreccion?.calificacion || "Aprobado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Destination */}
            <div>
              <Select
                label="Comisión y Turno Asignado"
                value={postComisionId}
                onChange={(e) => setPostComisionId(e.target.value)}
                options={comisiones.map((c) => ({
                  value: c.id,
                  label: `${c.nombre} (${c.cupoOcupado}/${c.cupoMaximo} cupos) - ${c.diasHorarios}`,
                }))}
              />
              {postSelectedComisionObj && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Ocupación: {postSelectedComisionObj.cupoOcupado} de {postSelectedComisionObj.cupoMaximo}
                  </span>
                  <span className="text-emerald-700 font-bold">✓ Vacante Disponible</span>
                </div>
              )}
            </div>

            {/* Month-based Fee Scale (No Mora) */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  Esquema de Cobro de Matrícula (Fijado por la Administración)
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Sin recargo por mora
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Mes de Pago de la Matrícula"
                  value={postMesPago}
                  onChange={(e) => handlePostMesChange(e.target.value)}
                  options={ESCALA_MESES_MATRICULA.map((e) => ({
                    value: e.value,
                    label: e.label,
                  }))}
                />

                <Input
                  label="Arancel a Cobrar (ARS)"
                  type="number"
                  value={postArancel}
                  onChange={(e) => setPostArancel(Number(e.target.value))}
                  required
                />
              </div>

              <div className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-amber-200/80">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  El arancel de matrícula no devenga intereses ni punitorios por mora. El valor está fijado únicamente según el mes en que la administración escolar registra el pago (septiembre, octubre, noviembre, etc.).
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Medio de Cobro en Mostrador"
                value={postMetodoPago}
                onChange={(e) =>
                  setPostMetodoPago(e.target.value as "Efectivo" | "Transferencia")
                }
                options={[
                  { value: "Efectivo", label: "Efectivo en Ventanilla (Emite Recibo)" },
                  { value: "Transferencia", label: "Transferencia Bancaria Online" },
                ]}
              />

              <Input
                label="Observaciones Administrativas"
                value={postObservaciones}
                onChange={(e) => setPostObservaciones(e.target.value)}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPostulanteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="coral" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                Confirmar Matrícula y Emitir Cobro ({formatCurrency(postArancel)})
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: FORMULARIO REGULAR DE MATRICULACIÓN */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Matrícula" : "Formulario de Matriculación Oficial"}
        subtitle="Vincule al estudiante con la comisión y aplique el arancel según el mes de pago fijado"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRegular} className="space-y-4 py-2">
          <Select
            label="Estudiante a Matricular"
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.nombreCompleto} (DNI ${e.dni}) - Legajo: ${e.legajoNumero}`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                label="Comisión y Turno de Destino"
                value={comisionId}
                onChange={(e) => setComisionId(e.target.value)}
                options={comisiones.map((c) => ({
                  value: c.id,
                  label: `${c.nombre} (${c.cupoOcupado}/${c.cupoMaximo} cupos)`,
                }))}
              />
              {selectedComisionObj && (
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Ocupación actual: {selectedComisionObj.cupoOcupado} de {selectedComisionObj.cupoMaximo}
                  </span>
                  {isCupoFull ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> ¡Cupo Completo!
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold">
                      ✓ Vacantes disponibles
                    </span>
                  )}
                </div>
              )}
            </div>

            <Select
              label="Gestión / Ciclo Lectivo"
              value={cicloLectivo}
              onChange={(e) => setCicloLectivo(e.target.value)}
              options={ciclosLectivos.map((c) => ({
                value: c.nombre,
                label: `${c.nombre} (${c.status})`,
              }))}
            />
          </div>

          {/* Month-based Fee Scale Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Arancel de Matrícula (Asignado por Mes — Sin Mora)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Exento de Mora
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Mes de Pago (Resolución de Administración)"
                value={mesPagoSeleccionado}
                onChange={(e) => handleMesChange(e.target.value)}
                options={ESCALA_MESES_MATRICULA.map((e) => ({
                  value: e.value,
                  label: e.label,
                }))}
              />

              <Input
                label="Monto Matrícula (ARS)"
                type="number"
                value={arancelMatricula}
                onChange={(e) => setArancelMatricula(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Forma de Pago del Arancel"
              value={metodoPago}
              onChange={(e) =>
                setMetodoPago(e.target.value as InscripcionItem["metodoPago"])
              }
              options={[
                { value: "Transferencia", label: "Transferencia Bancaria" },
                { value: "Efectivo", label: "Efectivo en Ventanilla" },
                { value: "Tarjeta", label: "Tarjeta de Débito/Crédito" },
              ]}
            />
            <Select
              label="Estado de Matrícula"
              value={estado}
              onChange={(e) => setEstado(e.target.value as InscripcionItem["estado"])}
              options={[
                { value: "Confirmada", label: "Confirmada" },
                { value: "Pendiente", label: "Pendiente de Pago" },
                { value: "Anulada", label: "Anulada" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones Administrativas
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Convenios especiales, bonificación por hermanos, constancias..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm">
              {isEditing ? "Guardar Modificaciones" : "Confirmar Matriculación"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedIns?.numeroMatricula || "Detalle de Inscripción"}
        maxWidth="md"
      >
        {selectedIns && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Matrícula:</span>
                <span className="font-bold text-[#00205B]">{selectedIns.numeroMatricula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estudiante:</span>
                <span className="font-bold text-slate-900">{selectedIns.estudianteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-mono">{selectedIns.estudianteDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comisión Asignada:</span>
                <span className="font-semibold">{selectedIns.comisionNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ciclo Lectivo:</span>
                <span>{selectedIns.cicloLectivo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Inscripción:</span>
                <span>{formatDate(selectedIns.fechaMatriculacion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arancel Abonado:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(selectedIns.arancelMatricula)} ({selectedIns.metodoPago})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <Badge variant={selectedIns.estado === "Confirmada" ? "success" : "warning"} size="sm">
                  {selectedIns.estado}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Observaciones:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600">
                {selectedIns.observaciones || "Sin observaciones registradas."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Anular Registro de Inscripción?"
        description={`¿Confirma que desea anular la matrícula "${selectedIns?.numeroMatricula}" del alumno ${selectedIns?.estudianteNombre}?`}
        confirmText="Anular Matrícula"
      />
    </div>
  );
}

export default function InscripcionesPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Cargando matriculaciones...</div>}>
      <InscripcionesContent />
    </Suspense>
  );
}
