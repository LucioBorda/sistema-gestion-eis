"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { PersonalDocenteItem } from "@/features/personal-docente/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function PersonalDocentePage(): React.ReactElement {
  const { personalDocente, addPersonalDocente, updatePersonalDocente, deletePersonalDocente } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedDocente, setSelectedDocente] = useState<PersonalDocenteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [dni, setDni] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [titulacion, setTitulacion] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [materiasInput, setMateriasInput] = useState("Reading & Writing Skills, English Phonetics");
  const [disponibilidadHoraria, setDisponibilidadHoraria] = useState(
    "Lunes a Jueves (Turno Tarde y Vespertino)"
  );
  const [antiguedadAnios, setAntiguedadAnios] = useState(3);
  const [estado, setEstado] = useState<PersonalDocenteItem["estado"]>("Activo");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedDocente(null);
    setDni("");
    setNombreCompleto("");
    setTitulacion("Profesor Superior en Lengua Inglesa (UNLP)");
    setEmail("");
    setTelefono("(0221) 15-");
    setMateriasInput("Reading & Writing Skills, Listening & Speaking");
    setDisponibilidadHoraria("Lunes a Jueves 16:00 - 21:00 hs");
    setAntiguedadAnios(1);
    setEstado("Activo");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PersonalDocenteItem) => {
    setIsEditing(true);
    setSelectedDocente(item);
    setDni(item.dni);
    setNombreCompleto(item.nombreCompleto);
    setTitulacion(item.titulacion);
    setEmail(item.email);
    setTelefono(item.telefono);
    setMateriasInput(item.materiasHabilitadas.join(", "));
    setDisponibilidadHoraria(item.disponibilidadHoraria);
    setAntiguedadAnios(item.antiguedadAnios);
    setEstado(item.estado);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: PersonalDocenteItem) => {
    setSelectedDocente(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: PersonalDocenteItem) => {
    setSelectedDocente(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const materias = materiasInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (isEditing && selectedDocente) {
      updatePersonalDocente({
        ...selectedDocente,
        dni,
        nombreCompleto,
        titulacion,
        email,
        telefono,
        materiasHabilitadas: materias,
        disponibilidadHoraria,
        antiguedadAnios,
        estado,
      });
    } else {
      const newDocente: PersonalDocenteItem = {
        id: `doc-${Date.now()}`,
        dni,
        nombreCompleto,
        titulacion,
        email,
        telefono,
        materiasHabilitadas: materias,
        disponibilidadHoraria,
        totalComisionesAsignadas: 0,
        estado,
        antiguedadAnios,
      };
      addPersonalDocente(newDocente);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedDocente) {
      deletePersonalDocente(selectedDocente.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "padron_docente_eis",
      [
        { header: "DNI", accessor: "dni" },
        { header: "Profesor / Docente", accessor: "nombreCompleto" },
        { header: "Titulación Académica", accessor: "titulacion" },
        { header: "Email", accessor: "email" },
        { header: "Teléfono", accessor: "telefono" },
        { header: "Materias Habilitadas", accessor: (d) => d.materiasHabilitadas.join(", ") },
        { header: "Disponibilidad", accessor: "disponibilidadHoraria" },
        { header: "Comisiones Asignadas", accessor: "totalComisionesAsignadas" },
        { header: "Estado", accessor: "estado" },
      ],
      personalDocente
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Padrón Oficial del Cuerpo Docente - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Docente</th>
            <th>Titulación</th>
            <th>Materias Habilitadas</th>
            <th>Comisiones</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${personalDocente
            .map(
              (d) => `
            <tr>
              <td><strong>${d.dni}</strong></td>
              <td>${d.nombreCompleto}</td>
              <td>${d.titulacion}</td>
              <td>${d.materiasHabilitadas.join(", ")}</td>
              <td>${d.totalComisionesAsignadas} comisiones</td>
              <td>${d.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón del Personal Docente", htmlBody);
  };

  const columns: ColumnDef<PersonalDocenteItem>[] = [
    {
      id: "dni",
      header: "DNI",
      accessorKey: "dni",
      sortable: true,
      className: "w-28 font-mono font-bold text-slate-800",
    },
    {
      id: "nombre",
      header: "Docente / Titulación",
      accessorKey: "nombreCompleto",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombreCompleto}</span>
          <span className="text-[11px] text-[#00205B] font-medium">{item.titulacion}</span>
        </div>
      ),
    },
    {
      id: "materias",
      header: "Materias que puede dictar",
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.materiasHabilitadas.map((m, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border"
            >
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "disponibilidad",
      header: "Disponibilidad Horaria",
      accessorKey: "disponibilidadHoraria",
      cell: (item) => (
        <span className="text-xs text-slate-600 block max-w-xs">
          {item.disponibilidadHoraria}
        </span>
      ),
    },
    {
      id: "comisiones",
      header: "Carga Actual",
      accessorKey: "totalComisionesAsignadas",
      sortable: true,
      cell: (item) => (
        <span className="text-xs font-bold text-[#00205B]">
          {item.totalComisionesAsignadas} comisiones
        </span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge
          variant={
            item.estado === "Activo"
              ? "success"
              : item.estado === "Licencia"
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
      <DataTable
        title="Padrón de Personal Docente"
        subtitle="Cuerpo de profesores titulares y coordinadores pedagógicos de exámenes internacionales"
        data={personalDocente}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Docente"
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
        title={isEditing ? "Editar Docente" : "Nuevo Registro Docente"}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="DNI del Docente"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <Input
              label="Nombre y Apellido Completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
          </div>

          <Input
            label="Titulación Académica y Especialización"
            value={titulacion}
            onChange={(e) => setTitulacion(e.target.value)}
            placeholder="ej: Profesor Superior en Lengua Inglesa (UNLP) & Anglia Master"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Institucional / Personal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Teléfono Móvil"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materias que puede dictar (Separadas por comas)
            </label>
            <input
              type="text"
              value={materiasInput}
              onChange={(e) => setMateriasInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Reading & Writing, Phonetics, Metodología..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Disponibilidad Horaria Semanal"
              value={disponibilidadHoraria}
              onChange={(e) => setDisponibilidadHoraria(e.target.value)}
              placeholder="ej: Lunes a Jueves Turno Tarde"
              required
            />
            <Select
              label="Estado Laboral"
              value={estado}
              onChange={(e) => setEstado(e.target.value as PersonalDocenteItem["estado"])}
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Licencia", label: "En Licencia" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
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
              {isEditing ? "Guardar Modificaciones" : "Registrar Docente"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedDocente?.nombreCompleto || "Ficha del Docente"}
        maxWidth="lg"
      >
        {selectedDocente && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-bold text-slate-800">{selectedDocente.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Titulación:</span>
                <span className="font-semibold text-[#00205B] text-right max-w-xs">
                  {selectedDocente.titulacion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-semibold">{selectedDocente.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold">{selectedDocente.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disponibilidad:</span>
                <span className="font-semibold">{selectedDocente.disponibilidadHoraria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comisiones Asignadas:</span>
                <span className="font-bold text-[#00205B]">
                  {selectedDocente.totalComisionesAsignadas} cursos activos
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Materias Habilitadas:
              </span>
              <div className="flex flex-wrap gap-1 p-3 bg-white border border-slate-200 rounded-lg">
                {selectedDocente.materiasHabilitadas.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-blue-50 text-[#00205B] border border-blue-200 font-semibold"
                  >
                    {m}
                  </span>
                ))}
              </div>
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
        title="¿Eliminar Docente?"
        description={`¿Confirma que desea eliminar el registro de "${selectedDocente?.nombreCompleto}"?`}
        confirmText="Eliminar Docente"
      />
    </div>
  );
}
