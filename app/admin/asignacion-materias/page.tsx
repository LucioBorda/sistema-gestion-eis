"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { AsignacionMateriaItem } from "@/features/asignacion-materias/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function AsignacionMateriasPage(): React.ReactElement {
  const {
    asignaciones,
    personalDocente,
    materias,
    comisiones,
    addAsignacion,
    updateAsignacion,
    deleteAsignacion,
  } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedAsig, setSelectedAsig] = useState<AsignacionMateriaItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [docenteId, setDocenteId] = useState(personalDocente[0]?.id || "");
  const [materiaId, setMateriaId] = useState(materias[0]?.id || "");
  const [comisionId, setComisionId] = useState(comisiones[0]?.id || "");
  const [horarioSemanal, setHorarioSemanal] = useState("Lunes y Miércoles 16:30 - 18:00 hs");
  const [aulaFisica, setAulaFisica] = useState("Aula 2");
  const [horasSemanales, setHorasSemanales] = useState(3);
  const [activo, setActivo] = useState(true);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedAsig(null);
    setDocenteId(personalDocente[0]?.id || "");
    setMateriaId(materias[0]?.id || "");
    setComisionId(comisiones[0]?.id || "");
    setHorarioSemanal("Lunes y Miércoles 16:30 - 18:00 hs");
    setAulaFisica("Aula 2");
    setHorasSemanales(3);
    setActivo(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AsignacionMateriaItem) => {
    setIsEditing(true);
    setSelectedAsig(item);
    setDocenteId(item.docenteId);
    setMateriaId(item.materiaId);
    setComisionId(item.comisionId);
    setHorarioSemanal(item.horarioSemanal);
    setAulaFisica(item.aulaFisica);
    setHorasSemanales(item.horasSemanales);
    setActivo(item.activo);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: AsignacionMateriaItem) => {
    setSelectedAsig(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: AsignacionMateriaItem) => {
    setSelectedAsig(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const docObj = personalDocente.find((d) => d.id === docenteId);
    const matObj = materias.find((m) => m.id === materiaId);
    const comObj = comisiones.find((c) => c.id === comisionId);

    const docenteNombre = docObj ? docObj.nombreCompleto : "Docente Asignado";
    const materiaNombre = matObj ? matObj.nombre : "Materia Asignada";
    const nivelNombre = matObj ? matObj.nivelNombre : "Nivel";
    const comisionNombre = comObj ? comObj.nombre : "Comisión";

    if (isEditing && selectedAsig) {
      updateAsignacion({
        ...selectedAsig,
        docenteId,
        docenteNombre,
        materiaId,
        materiaNombre,
        nivelNombre,
        comisionId,
        comisionNombre,
        horarioSemanal,
        aulaFisica,
        horasSemanales,
        activo,
      });
    } else {
      const newAsig: AsignacionMateriaItem = {
        id: `asig-${Date.now()}`,
        docenteId,
        docenteNombre,
        materiaId,
        materiaNombre,
        nivelNombre,
        comisionId,
        comisionNombre,
        horarioSemanal,
        aulaFisica,
        horasSemanales,
        activo,
      };
      addAsignacion(newAsig);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedAsig) {
      deleteAsignacion(selectedAsig.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "asignacion_docente_materias_eis",
      [
        { header: "Docente", accessor: "docenteNombre" },
        { header: "Materia", accessor: "materiaNombre" },
        { header: "Nivel", accessor: "nivelNombre" },
        { header: "Comisión", accessor: "comisionNombre" },
        { header: "Horario Semanal", accessor: "horarioSemanal" },
        { header: "Aula", accessor: "aulaFisica" },
        { header: "Carga Horaria", accessor: "horasSemanales" },
        { header: "Estado", accessor: (a) => (a.activo ? "Activa" : "Inactiva") },
      ],
      asignaciones
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Distribución Horaria y Asignación de Cátedras - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Docente Titular</th>
            <th>Materia / Cátedra</th>
            <th>Comisión</th>
            <th>Horario Semanal</th>
            <th>Aula</th>
          </tr>
        </thead>
        <tbody>
          ${asignaciones
            .map(
              (a) => `
            <tr>
              <td><strong>${a.docenteNombre}</strong></td>
              <td>${a.materiaNombre}</td>
              <td>${a.comisionNombre}</td>
              <td>${a.horarioSemanal}</td>
              <td>${a.aulaFisica}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón de Asignaciones de Cátedras", htmlBody);
  };

  const columns: ColumnDef<AsignacionMateriaItem>[] = [
    {
      id: "docente",
      header: "Docente Titular",
      accessorKey: "docenteNombre",
      sortable: true,
      cell: (item) => (
        <span className="font-bold text-slate-900 block">{item.docenteNombre}</span>
      ),
    },
    {
      id: "materia",
      header: "Materia Curricular",
      accessorKey: "materiaNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-semibold text-[#00205B] block">{item.materiaNombre}</span>
          <span className="text-[11px] text-slate-400">{item.nivelNombre}</span>
        </div>
      ),
    },
    {
      id: "comision",
      header: "Comisión y Horario",
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800 block">{item.comisionNombre}</span>
          <span className="text-[11px] text-slate-500">{item.horarioSemanal}</span>
        </div>
      ),
    },
    {
      id: "aula",
      header: "Aula",
      accessorKey: "aulaFisica",
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">{item.aulaFisica}</span>
      ),
    },
    {
      id: "horas",
      header: "Carga",
      cell: (item) => (
        <span className="text-xs font-bold text-slate-800">{item.horasSemanales} hs</span>
      ),
    },
    {
      id: "activo",
      header: "Estado",
      cell: (item) => (
        <Badge variant={item.activo ? "success" : "default"} size="sm">
          {item.activo ? "Vigente" : "Inactiva"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Asignación Docente de Materias y Horarios"
        subtitle="Vinculación de profesores titulares a comisiones, materias, días y aulas asignadas"
        data={asignaciones}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nueva Asignación"
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
        title={isEditing ? "Editar Asignación" : "Nueva Asignación de Materia"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Select
            label="Profesor / Docente Titular"
            value={docenteId}
            onChange={(e) => setDocenteId(e.target.value)}
            options={personalDocente.map((d) => ({
              value: d.id,
              label: `${d.nombreCompleto} (${d.titulacion.split("(")[0]})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Materia Curricular"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              options={materias.map((m) => ({
                value: m.id,
                label: `${m.nombre} (${m.nivelNombre})`,
              }))}
            />
            <Select
              label="Comisión / Grado"
              value={comisionId}
              onChange={(e) => setComisionId(e.target.value)}
              options={comisiones.map((c) => ({
                value: c.id,
                label: `${c.nombre} (${c.turno})`,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Días y Horarios Semanales"
              value={horarioSemanal}
              onChange={(e) => setHorarioSemanal(e.target.value)}
              required
            />
            <Input
              label="Aula Física"
              value={aulaFisica}
              onChange={(e) => setAulaFisica(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Carga Horaria Semanal (hs cátedra)"
              type="number"
              value={horasSemanales}
              onChange={(e) => setHorasSemanales(Number(e.target.value))}
              required
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded text-[#00205B] focus:ring-[#00205B] w-4 h-4"
                />
                <span>Asignación vigente en el ciclo lectivo actual</span>
              </label>
            </div>
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
              {isEditing ? "Guardar Modificaciones" : "Crear Asignación"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Ficha de Asignación Docente"
        maxWidth="md"
      >
        {selectedAsig && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Docente Titular:</span>
                <span className="font-bold text-slate-800">{selectedAsig.docenteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Materia:</span>
                <span className="font-bold text-[#00205B]">{selectedAsig.materiaNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comisión:</span>
                <span className="font-semibold">{selectedAsig.comisionNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Días y Horarios:</span>
                <span className="font-semibold">{selectedAsig.horarioSemanal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aula Física:</span>
                <span className="font-semibold">{selectedAsig.aulaFisica}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carga Horaria:</span>
                <span className="font-bold text-[#00205B]">{selectedAsig.horasSemanales} horas cátedra</span>
              </div>
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
        title="¿Eliminar Asignación Docente?"
        description={`¿Confirma que desea desvincular a ${selectedAsig?.docenteNombre} de la materia ${selectedAsig?.materiaNombre}?`}
        confirmText="Eliminar Asignación"
      />
    </div>
  );
}
