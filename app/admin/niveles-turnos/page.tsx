"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { NivelTurno, TurnoType } from "@/features/niveles-turnos/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function NivelesTurnosPage(): React.ReactElement {
  const { nivelesTurnos, addNivel, updateNivel, deleteNivel } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedNivel, setSelectedNivel] = useState<NivelTurno | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [edadesSugeridas, setEdadesSugeridas] = useState("");
  const [turnosDisponibles, setTurnosDisponibles] = useState<TurnoType[]>(["Tarde"]);
  const [duracionAnios, setDuracionAnios] = useState(3);
  const [activo, setActivo] = useState(true);
  const [certificacionFinal, setCertificacionFinal] = useState("");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedNivel(null);
    setCodigo(`NIV-${Date.now().toString().slice(-3)}`);
    setNombre("");
    setDescripcion("");
    setEdadesSugeridas("6 a 12 años");
    setTurnosDisponibles(["Tarde"]);
    setDuracionAnios(3);
    setActivo(true);
    setCertificacionFinal("Certificación Anglia Oficial");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: NivelTurno) => {
    setIsEditing(true);
    setSelectedNivel(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setDescripcion(item.descripcion);
    setEdadesSugeridas(item.edadesSugeridas);
    setTurnosDisponibles(item.turnosDisponibles);
    setDuracionAnios(item.duracionAnios);
    setActivo(item.activo);
    setCertificacionFinal(item.certificacionFinal);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: NivelTurno) => {
    setSelectedNivel(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: NivelTurno) => {
    setSelectedNivel(item);
    setConfirmDeleteOpen(true);
  };

  const toggleTurno = (turno: TurnoType) => {
    if (turnosDisponibles.includes(turno)) {
      if (turnosDisponibles.length > 1) {
        setTurnosDisponibles((prev) => prev.filter((t) => t !== turno));
      }
    } else {
      setTurnosDisponibles((prev) => [...prev, turno]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedNivel) {
      updateNivel({
        ...selectedNivel,
        codigo,
        nombre,
        descripcion,
        edadesSugeridas,
        turnosDisponibles,
        duracionAnios,
        activo,
        certificacionFinal,
      });
    } else {
      const newNivel: NivelTurno = {
        id: `niv-${Date.now()}`,
        codigo,
        nombre,
        descripcion,
        edadesSugeridas,
        turnosDisponibles,
        duracionAnios,
        activo,
        certificacionFinal,
      };
      addNivel(newNivel);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedNivel) {
      deleteNivel(selectedNivel.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "niveles_eis",
      [
        { header: "Código", accessor: "codigo" },
        { header: "Nivel Académico", accessor: "nombre" },
        { header: "Edades", accessor: "edadesSugeridas" },
        { header: "Turnos", accessor: (n) => n.turnosDisponibles.join(", ") },
        { header: "Años Duración", accessor: "duracionAnios" },
        { header: "Certificación", accessor: "certificacionFinal" },
        { header: "Estado", accessor: (n) => (n.activo ? "Activo" : "Inactivo") },
      ],
      nivelesTurnos
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Estructura Académica Oficial por Niveles - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nivel</th>
            <th>Edades Sugeridas</th>
            <th>Turnos Habilitados</th>
            <th>Certificación Obtenida</th>
          </tr>
        </thead>
        <tbody>
          ${nivelesTurnos
            .map(
              (n) => `
            <tr>
              <td><strong>${n.codigo}</strong></td>
              <td>${n.nombre}</td>
              <td>${n.edadesSugeridas}</td>
              <td>${n.turnosDisponibles.join(", ")}</td>
              <td>${n.certificacionFinal}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Catálogo de Niveles Académicos", htmlBody);
  };

  const columns: ColumnDef<NivelTurno>[] = [
    {
      id: "codigo",
      header: "Código",
      accessorKey: "codigo",
      sortable: true,
      className: "w-24 font-bold text-[#00205B]",
    },
    {
      id: "nombre",
      header: "Nivel Académico",
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
      id: "edades",
      header: "Edades",
      accessorKey: "edadesSugeridas",
      cell: (item) => <span className="text-xs text-slate-600">{item.edadesSugeridas}</span>,
    },
    {
      id: "turnos",
      header: "Turnos",
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.turnosDisponibles.map((t) => (
            <span
              key={t}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "certificacion",
      header: "Certificación Final",
      cell: (item) => (
        <span className="text-xs font-semibold text-[#00205B]">
          {item.certificacionFinal}
        </span>
      ),
    },
    {
      id: "activo",
      header: "Estado",
      cell: (item) => (
        <Badge variant={item.activo ? "success" : "default"} size="sm">
          {item.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Niveles"
        subtitle="Estructura curricular con los 19 niveles oficiales individuales de EIS Institute"
        data={nivelesTurnos}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Nivel"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        initialPageSize={10}
      />

      {/* MODAL: FORMULARIO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Nivel Educativo" : "Nuevo Nivel Educativo"}
        subtitle="Complete los parámetros pedagógicos y turnos correspondientes"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Código del Nivel"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <Input
              label="Nombre del Nivel"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <Input
            label="Descripción General"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Edades Sugeridas"
              value={edadesSugeridas}
              onChange={(e) => setEdadesSugeridas(e.target.value)}
              required
            />
            <Input
              label="Duración Estimada (Años)"
              type="number"
              value={duracionAnios}
              onChange={(e) => setDuracionAnios(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Turnos Habilitados (Seleccione los disponibles)
            </label>
            <div className="flex gap-2">
              {(["Mañana", "Tarde", "Vespertino"] as TurnoType[]).map((t) => {
                const isSelected = turnosDisponibles.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTurno(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      isSelected
                        ? "bg-[#00205B] text-white border-[#00205B]"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? `✓ ${t}` : t}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Certificación Final / Titulación"
            value={certificacionFinal}
            onChange={(e) => setCertificacionFinal(e.target.value)}
            required
          />

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="rounded text-[#00205B] focus:ring-[#00205B] w-4 h-4"
              />
              <span>Nivel activo para matriculación en el presente ciclo</span>
            </label>
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
              {isEditing ? "Guardar Modificaciones" : "Crear Nivel"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedNivel?.nombre || "Ficha del Nivel"}
        maxWidth="lg"
      >
        {selectedNivel && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Código:</span>
                <span className="font-bold text-[#00205B]">{selectedNivel.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Edades Sugeridas:</span>
                <span className="font-semibold">{selectedNivel.edadesSugeridas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duración:</span>
                <span className="font-semibold">{selectedNivel.duracionAnios} años</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Turnos Disponibles:</span>
                <div className="flex gap-1">
                  {selectedNivel.turnosDisponibles.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-white text-slate-800 border text-[10px] font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certificación:</span>
                <span className="font-bold text-[#00205B]">
                  {selectedNivel.certificacionFinal}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Descripción:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                {selectedNivel.descripcion}
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
        title="¿Eliminar Nivel Educativo?"
        description={`¿Confirma que desea eliminar el nivel "${selectedNivel?.nombre}"?`}
        confirmText="Eliminar Nivel"
      />
    </div>
  );
}
