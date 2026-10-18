"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { CicloLectivo, CicloLectivoStatus } from "@/features/gestion-educativa/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function GestionEducativaPage(): React.ReactElement {
  const { ciclosLectivos, addCiclo, updateCiclo, deleteCiclo } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedCiclo, setSelectedCiclo] = useState<CicloLectivo | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [year, setYear] = useState(2027);
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("2027-03-01");
  const [fechaCierre, setFechaCierre] = useState("2027-12-17");
  const [status, setStatus] = useState<CicloLectivoStatus>("Planificado");
  const [matriculacionAbierta, setMatriculacionAbierta] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedCiclo(null);
    setYear(new Date().getFullYear() + 1);
    setNombre(`Ciclo Lectivo ${new Date().getFullYear() + 1}`);
    setFechaInicio("2027-03-01");
    setFechaCierre("2027-12-17");
    setStatus("Planificado");
    setMatriculacionAbierta(false);
    setObservaciones("");
    setModalOpen(true);
  };

  const handleOpenEdit = (ciclo: CicloLectivo) => {
    setIsEditing(true);
    setSelectedCiclo(ciclo);
    setYear(ciclo.year);
    setNombre(ciclo.nombre);
    setFechaInicio(ciclo.fechaInicio);
    setFechaCierre(ciclo.fechaCierre);
    setStatus(ciclo.status);
    setMatriculacionAbierta(ciclo.matriculacionAbierta);
    setObservaciones(ciclo.observaciones);
    setModalOpen(true);
  };

  const handleOpenDetail = (ciclo: CicloLectivo) => {
    setSelectedCiclo(ciclo);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (ciclo: CicloLectivo) => {
    setSelectedCiclo(ciclo);
    setConfirmDeleteOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedCiclo) {
      updateCiclo({
        ...selectedCiclo,
        year,
        nombre,
        fechaInicio,
        fechaCierre,
        status,
        matriculacionAbierta,
        observaciones,
      });
    } else {
      const newCiclo: CicloLectivo = {
        id: `ciclo-${year}`,
        year,
        nombre,
        fechaInicio,
        fechaCierre,
        status,
        matriculacionAbierta,
        totalAlumnosInscritos: 0,
        observaciones,
      };
      addCiclo(newCiclo);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCiclo) {
      deleteCiclo(selectedCiclo.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "ciclos_lectivos_eis",
      [
        { header: "Año", accessor: "year" },
        { header: "Denominación", accessor: "nombre" },
        { header: "Fecha Inicio", accessor: (c) => formatDate(c.fechaInicio) },
        { header: "Fecha Cierre", accessor: (c) => formatDate(c.fechaCierre) },
        { header: "Estado", accessor: "status" },
        { header: "Matrícula Abierta", accessor: (c) => (c.matriculacionAbierta ? "SÍ" : "NO") },
        { header: "Total Inscritos", accessor: "totalAlumnosInscritos" },
      ],
      ciclosLectivos
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Padrón Histórico de Ciclos Lectivos Registrados en EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Año</th>
            <th>Nombre del Ciclo</th>
            <th>Período Lectivo</th>
            <th>Estado</th>
            <th>Inscritos</th>
          </tr>
        </thead>
        <tbody>
          ${ciclosLectivos
            .map(
              (c) => `
            <tr>
              <td><strong>${c.year}</strong></td>
              <td>${c.nombre}</td>
              <td>${formatDate(c.fechaInicio)} al ${formatDate(c.fechaCierre)}</td>
              <td>${c.status}</td>
              <td>${c.totalAlumnosInscritos} alumnos</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón de Ciclos Lectivos", htmlBody);
  };

  const columns: ColumnDef<CicloLectivo>[] = [
    {
      id: "year",
      header: "Año",
      accessorKey: "year",
      sortable: true,
      className: "w-20 font-bold text-slate-900",
    },
    {
      id: "nombre",
      header: "Denominación",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-[#00205B] block">{item.nombre}</span>
          <span className="text-[11px] text-slate-400">
            {formatDate(item.fechaInicio)} · {formatDate(item.fechaCierre)}
          </span>
        </div>
      ),
    },
    {
      id: "fechas",
      header: "Período Lectivo",
      cell: (item) => (
        <span className="text-xs text-slate-600">
          {formatDate(item.fechaInicio)} al {formatDate(item.fechaCierre)}
        </span>
      ),
    },
    {
      id: "inscritos",
      header: "Inscripciones",
      accessorKey: "totalAlumnosInscritos",
      sortable: true,
      cell: (item) => (
        <span className="font-semibold text-slate-800">
          {item.totalAlumnosInscritos} estudiantes
        </span>
      ),
    },
    {
      id: "matricula",
      header: "Matrícula",
      cell: (item) => (
        <Badge
          variant={item.matriculacionAbierta ? "success" : "default"}
          size="sm"
        >
          {item.matriculacionAbierta ? "Abierta" : "Cerrada"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Estado",
      accessorKey: "status",
      sortable: true,
      cell: (item) => (
        <Badge
          variant={
            item.status === "Vigente"
              ? "coral"
              : item.status === "Planificado"
              ? "navy"
              : "default"
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Gestión de Ciclos Lectivos"
        subtitle="Apertura, vigencia y cierre contable/académico de ciclos lectivos de EIS Institute"
        data={ciclosLectivos}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Ciclo Lectivo"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        initialPageSize={5}
      />

      {/* MODAL: CREAR / EDITAR */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Ciclo Lectivo" : "Nuevo Ciclo Lectivo"}
        subtitle="Defina las fechas oficiales de inicio, cierre y estado de matriculación"
        maxWidth="md"
      >
        <form onSubmit={handleSaveForm} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Año Lectivo"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
            <Select
              label="Estado del Ciclo"
              value={status}
              onChange={(e) => setStatus(e.target.value as CicloLectivoStatus)}
              options={[
                { value: "Planificado", label: "Planificado" },
                { value: "Vigente", label: "Vigente (En Curso)" },
                { value: "Cerrado", label: "Cerrado / Concluido" },
              ]}
            />
          </div>

          <Input
            label="Denominación Oficial"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha de Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
            <Input
              label="Fecha de Cierre"
              type="date"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              required
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={matriculacionAbierta}
                onChange={(e) => setMatriculacionAbierta(e.target.checked)}
                className="rounded text-[#00205B] focus:ring-[#00205B] w-4 h-4"
              />
              <span>Habilitar matriculación pública y pre-inscripciones</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones Académicas
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Notas sobre cronograma Anglia, fechas de inscripción y cierres..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm">
              {isEditing ? "Guardar Modificaciones" : "Registrar Ciclo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCiclo?.nombre || "Detalle del Ciclo"}
        maxWidth="md"
      >
        {selectedCiclo && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Año:</span>
                <span className="font-bold text-slate-800">{selectedCiclo.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <Badge variant={selectedCiclo.status === "Vigente" ? "coral" : "navy"} size="sm">
                  {selectedCiclo.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Período Lectivo:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedCiclo.fechaInicio)} al {formatDate(selectedCiclo.fechaCierre)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alumnos Registrados:</span>
                <span className="font-bold text-[#00205B]">
                  {selectedCiclo.totalAlumnosInscritos} estudiantes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matrícula Abierta:</span>
                <span className="font-semibold">{selectedCiclo.matriculacionAbierta ? "Sí" : "No"}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Observaciones:</span>
              <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedCiclo.observaciones || "Sin observaciones adicionales."}
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

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Ciclo Lectivo?"
        description={`¿Está seguro de eliminar el registro del "${selectedCiclo?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Ciclo"
      />
    </div>
  );
}
