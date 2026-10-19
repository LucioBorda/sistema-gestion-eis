"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { Materia } from "@/features/materias/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function MateriasPage(): React.ReactElement {
  const { materias, nivelesTurnos, addMateria, updateMateria, deleteMateria } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nivelId, setNivelId] = useState(nivelesTurnos[0]?.id || "niv-jun1");
  const [cargaHorariaSemanal, setCargaHorariaSemanal] = useState(3);
  const [tipo, setTipo] = useState<Materia["tipo"]>("Troncal");
  const [regimen, setRegimen] = useState<Materia["regimen"]>("Anual");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedMateria(null);
    setCodigo(`MAT-${Date.now().toString().slice(-4)}`);
    setNombre("");
    setNivelId(nivelesTurnos[0]?.id || "niv-jun1");
    setCargaHorariaSemanal(3);
    setTipo("Troncal");
    setRegimen("Anual");
    setDescripcion("");
    setActivo(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Materia) => {
    setIsEditing(true);
    setSelectedMateria(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setNivelId(item.nivelId);
    setCargaHorariaSemanal(item.cargaHorariaSemanal);
    setTipo(item.tipo);
    setRegimen(item.regimen);
    setDescripcion(item.descripcion);
    setActivo(item.activo);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: Materia) => {
    setSelectedMateria(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: Materia) => {
    setSelectedMateria(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nivelObj = nivelesTurnos.find((n) => n.id === nivelId);
    const nivelNombre = nivelObj ? nivelObj.nombre : "Nivel General";

    if (isEditing && selectedMateria) {
      updateMateria({
        ...selectedMateria,
        codigo,
        nombre,
        nivelId,
        nivelNombre,
        cargaHorariaSemanal,
        tipo,
        regimen,
        descripcion,
        activo,
      });
    } else {
      const newMateria: Materia = {
        id: `mat-${Date.now()}`,
        codigo,
        nombre,
        nivelId,
        nivelNombre,
        cargaHorariaSemanal,
        tipo,
        regimen,
        descripcion,
        activo,
      };
      addMateria(newMateria);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedMateria) {
      deleteMateria(selectedMateria.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "catalogo_materias_eis",
      [
        { header: "Código", accessor: "codigo" },
        { header: "Materia / Trayecto", accessor: "nombre" },
        { header: "Nivel", accessor: "nivelNombre" },
        { header: "Horas Semanales", accessor: "cargaHorariaSemanal" },
        { header: "Tipo", accessor: "tipo" },
        { header: "Régimen", accessor: "regimen" },
        { header: "Descripción", accessor: "descripcion" },
        { header: "Estado", accessor: (m) => (m.activo ? "Activa" : "Inactiva") },
      ],
      materias
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Catálogo Curricular Oficial de Materias y Trayectos - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Asignatura</th>
            <th>Nivel</th>
            <th>Carga Horaria</th>
            <th>Tipo</th>
            <th>Régimen</th>
          </tr>
        </thead>
        <tbody>
          ${materias
            .map(
              (m) => `
            <tr>
              <td><strong>${m.codigo}</strong></td>
              <td>${m.nombre}</td>
              <td>${m.nivelNombre}</td>
              <td>${m.cargaHorariaSemanal} hs/sem</td>
              <td>${m.tipo}</td>
              <td>${m.regimen}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Catálogo de Materias Curriculares", htmlBody);
  };

  const columns: ColumnDef<Materia>[] = [
    {
      id: "codigo",
      header: "Código",
      accessorKey: "codigo",
      sortable: true,
      className: "w-24 font-bold text-[#00205B]",
    },
    {
      id: "nombre",
      header: "Asignatura / Trayecto",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombre}</span>
          <span className="text-[11px] text-slate-400">{item.descripcion}</span>
        </div>
      ),
    },
    {
      id: "nivel",
      header: "Nivel Asociado",
      accessorKey: "nivelNombre",
      sortable: true,
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">{item.nivelNombre}</span>
      ),
    },
    {
      id: "tipo",
      header: "Tipo / Régimen",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <Badge variant="navy" size="sm">
            {item.tipo}
          </Badge>
          <span className="text-[10px] text-slate-400">{item.regimen}</span>
        </div>
      ),
    },
    {
      id: "carga",
      header: "Carga Horaria",
      accessorKey: "cargaHorariaSemanal",
      sortable: true,
      cell: (item) => (
        <span className="text-xs font-bold text-slate-800">
          {item.cargaHorariaSemanal} hs/sem
        </span>
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
        title="Catálogo Curricular de Materias"
        subtitle="Contenidos programáticos de habilidades de lectura, oralidad, fonética y trayectos UTN"
        data={materias}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nueva Materia"
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
        title={isEditing ? "Editar Materia" : "Nueva Materia Curricular"}
        subtitle="Complete los detalles curriculares de la asignatura"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Código de Asignatura"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <Input
              label="Nombre de la Materia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Nivel Pedagógico"
              value={nivelId}
              onChange={(e) => setNivelId(e.target.value)}
              options={nivelesTurnos.map((n) => ({
                value: n.id,
                label: n.nombre,
              }))}
            />
            <Select
              label="Tipo de Materia"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Materia["tipo"])}
              options={[
                { value: "Troncal", label: "Troncal" },
                { value: "Taller", label: "Taller Práctico" },
                { value: "Práctica Pedagógica", label: "Práctica Pedagógica" },
                { value: "Optativa", label: "Optativa" },
              ]}
            />
            <Select
              label="Régimen"
              value={regimen}
              onChange={(e) => setRegimen(e.target.value as Materia["regimen"])}
              options={[
                { value: "Anual", label: "Anual" },
                { value: "Cuatrimestral", label: "Cuatrimestral" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Carga Horaria Semanal (Horas Cátedra)"
              type="number"
              value={cargaHorariaSemanal}
              onChange={(e) => setCargaHorariaSemanal(Number(e.target.value))}
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
                <span>Materia habilitada en planes de estudio vigentes</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción y Enfoque Pedagógico
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Objetivos de aprendizaje, destrezas Anglia y bibliografía recomendada..."
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto justify-center"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="coral"
              size="sm"
              className="w-full sm:w-auto justify-center"
            >
              {isEditing ? "Guardar Modificaciones" : "Registrar Materia"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedMateria?.nombre || "Detalle de Materia"}
        maxWidth="lg"
      >
        {selectedMateria && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Código:</span>
                <span className="font-bold text-[#00205B]">{selectedMateria.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel Pedagógico:</span>
                <span className="font-semibold">{selectedMateria.nivelNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Materia:</span>
                <Badge variant="navy" size="sm">
                  {selectedMateria.tipo}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Régimen:</span>
                <span className="font-semibold">{selectedMateria.regimen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carga Horaria:</span>
                <span className="font-bold text-[#00205B]">
                  {selectedMateria.cargaHorariaSemanal} horas cátedra semanales
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Descripción:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                {selectedMateria.descripcion}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
                className="w-full sm:w-auto justify-center"
              >
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
        title="¿Eliminar Materia Curricular?"
        description={`¿Confirma que desea eliminar la materia "${selectedMateria?.nombre}"?`}
        confirmText="Eliminar Materia"
      />
    </div>
  );
}
