"use client";

import React, { useState } from "react";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function InscripcionesPage(): React.ReactElement {
  const {
    inscripciones,
    estudiantes,
    comisiones,
    ciclosLectivos,
    addInscripcion,
    updateInscripcion,
    deleteInscripcion,
  } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedIns, setSelectedIns] = useState<InscripcionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [comisionId, setComisionId] = useState(comisiones[0]?.id || "");
  const [cicloLectivo, setCicloLectivo] = useState("Ciclo Lectivo 2026");
  const [arancelMatricula, setArancelMatricula] = useState(35000);
  const [metodoPago, setMetodoPago] = useState<InscripcionItem["metodoPago"]>("Transferencia");
  const [estado, setEstado] = useState<InscripcionItem["estado"]>("Confirmada");
  const [observaciones, setObservaciones] = useState("");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedIns(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setComisionId(comisiones[0]?.id || "");
    setCicloLectivo("Ciclo Lectivo 2026");
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

  const handleSave = (e: React.FormEvent) => {
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
      <DataTable
        title="Inscripciones y Matriculaciones"
        subtitle="Control de altas de matrícula por ciclo lectivo con validación de vacantes y cupo en tiempo real"
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

      {/* MODAL: FORMULARIO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Matrícula" : "Formulario de Matriculación Oficial"}
        subtitle="Vincule al estudiante con la comisión y verifique el cupo disponible"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Select
            label="Estudiante a Matricular"
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.nombreCompleto} (DNI ${e.dni}) - Legajo: ${e.legajoNumero}`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Arancel de Matrícula (ARS)"
              type="number"
              value={arancelMatricula}
              onChange={(e) => setArancelMatricula(Number(e.target.value))}
              required
            />
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
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
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

      {/* MODAL: VER DETALLE */}
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
