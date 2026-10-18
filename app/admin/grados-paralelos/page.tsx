"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { Comision } from "@/features/comisiones/types";
import { TurnoType } from "@/features/niveles-turnos/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function GradosParalelosPage(): React.ReactElement {
  const { comisiones, nivelesTurnos, addComision, updateComision, deleteComision } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedComision, setSelectedComision] = useState<Comision | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nivelId, setNivelId] = useState(nivelesTurnos[0]?.id || "niv-3");
  const [turno, setTurno] = useState<TurnoType>("Tarde");
  const [diasHorarios, setDiasHorarios] = useState("");
  const [aulaFisica, setAulaFisica] = useState("Aula 1");
  const [cupoMaximo, setCupoMaximo] = useState(18);
  const [activo, setActivo] = useState(true);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedComision(null);
    setCodigo(`COM-${Date.now().toString().slice(-4)}`);
    setNombre("");
    setNivelId(nivelesTurnos[0]?.id || "niv-3");
    setTurno("Tarde");
    setDiasHorarios("Lunes y Miércoles 16:30 - 18:00 hs");
    setAulaFisica("Aula 2 (Laboratorio)");
    setCupoMaximo(18);
    setActivo(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Comision) => {
    setIsEditing(true);
    setSelectedComision(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setNivelId(item.nivelId);
    setTurno(item.turno);
    setDiasHorarios(item.diasHorarios);
    setAulaFisica(item.aulaFisica);
    setCupoMaximo(item.cupoMaximo);
    setActivo(item.activo);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: Comision) => {
    setSelectedComision(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: Comision) => {
    setSelectedComision(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nivelObj = nivelesTurnos.find((n) => n.id === nivelId);
    const nivelNombre = nivelObj ? nivelObj.nombre : "Nivel General";

    if (isEditing && selectedComision) {
      updateComision({
        ...selectedComision,
        codigo,
        nombre,
        nivelId,
        nivelNombre,
        turno,
        diasHorarios,
        aulaFisica,
        cupoMaximo,
        activo,
      });
    } else {
      const newComision: Comision = {
        id: `com-${Date.now()}`,
        codigo,
        nombre,
        nivelId,
        nivelNombre,
        turno,
        diasHorarios,
        aulaFisica,
        cupoMaximo,
        cupoOcupado: 0,
        activo,
      };
      addComision(newComision);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedComision) {
      deleteComision(selectedComision.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "comisiones_grados_eis",
      [
        { header: "Código", accessor: "codigo" },
        { header: "Comisión / Curso", accessor: "nombre" },
        { header: "Nivel Pedagógico", accessor: "nivelNombre" },
        { header: "Turno", accessor: "turno" },
        { header: "Días y Horarios", accessor: "diasHorarios" },
        { header: "Aula Física", accessor: "aulaFisica" },
        { header: "Cupo Máximo", accessor: "cupoMaximo" },
        { header: "Inscritos Actuales", accessor: "cupoOcupado" },
        { header: "Estado", accessor: (c) => (c.activo ? "Activo" : "Inactivo") },
      ],
      comisiones
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Distribución de Comisiones, Cupos y Aulas Físicas - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Comisión</th>
            <th>Nivel</th>
            <th>Turno</th>
            <th>Horario</th>
            <th>Aula</th>
            <th>Cupo</th>
          </tr>
        </thead>
        <tbody>
          ${comisiones
            .map(
              (c) => `
            <tr>
              <td><strong>${c.nombre}</strong> (${c.codigo})</td>
              <td>${c.nivelNombre}</td>
              <td>${c.turno}</td>
              <td>${c.diasHorarios}</td>
              <td>${c.aulaFisica}</td>
              <td>${c.cupoOcupado} / ${c.cupoMaximo}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón de Comisiones y Cupos", htmlBody);
  };

  const columns: ColumnDef<Comision>[] = [
    {
      id: "codigo",
      header: "Código",
      accessorKey: "codigo",
      sortable: true,
      className: "w-24 font-bold text-[#00205B]",
    },
    {
      id: "nombre",
      header: "Comisión / Grado",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombre}</span>
          <span className="text-[11px] text-slate-400">{item.nivelNombre}</span>
        </div>
      ),
    },
    {
      id: "turno",
      header: "Turno / Horario",
      cell: (item) => (
        <div>
          <Badge variant="navy" size="sm">
            {item.turno}
          </Badge>
          <div className="text-[11px] text-slate-500 mt-0.5">{item.diasHorarios}</div>
        </div>
      ),
    },
    {
      id: "aula",
      header: "Aula Física",
      accessorKey: "aulaFisica",
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">{item.aulaFisica}</span>
      ),
    },
    {
      id: "cupo",
      header: "Ocupación de Cupo",
      cell: (item) => {
        const pct = Math.round((item.cupoOcupado / item.cupoMaximo) * 100);
        const isFull = item.cupoOcupado >= item.cupoMaximo;
        return (
          <div className="w-32">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-700">
                {item.cupoOcupado} / {item.cupoMaximo}
              </span>
              <span
                className={`font-semibold ${
                  isFull ? "text-rose-600" : pct > 80 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {pct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  isFull ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-[#00205B]"
                }`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "activo",
      header: "Estado",
      cell: (item) => (
        <Badge variant={item.activo ? "success" : "default"} size="sm">
          {item.activo ? "Habilitada" : "Inactiva"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Grados y Paralelos / Comisiones"
        subtitle="Asignación de cursos por nivel, turno, horarios semanales y control de cupo en aula"
        data={comisiones}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nueva Comisión"
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
        title={isEditing ? "Editar Comisión" : "Nueva Comisión Académica"}
        subtitle="Configure los parámetros de aula física, cupo límite y turno"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Código de Comisión"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <Input
              label="Nombre de la Comisión (ej: Juniors 1 - A)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Nivel Académico"
              value={nivelId}
              onChange={(e) => setNivelId(e.target.value)}
              options={nivelesTurnos.map((n) => ({
                value: n.id,
                label: `${n.codigo} - ${n.nombre}`,
              }))}
            />
            <Select
              label="Turno"
              value={turno}
              onChange={(e) => setTurno(e.target.value as TurnoType)}
              options={[
                { value: "Mañana", label: "Turno Mañana" },
                { value: "Tarde", label: "Turno Tarde" },
                { value: "Vespertino", label: "Turno Vespertino / Noche" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Días y Horarios"
              value={diasHorarios}
              onChange={(e) => setDiasHorarios(e.target.value)}
              placeholder="ej: Lunes y Miércoles 16:30 - 18:00 hs"
              required
            />
            <Input
              label="Aula Física Asignada"
              value={aulaFisica}
              onChange={(e) => setAulaFisica(e.target.value)}
              placeholder="ej: Aula 2 (Laboratorio)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cupo Máximo de Alumnos"
              type="number"
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(Number(e.target.value))}
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
                <span>Comisión habilitada para inscripciones</span>
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
              {isEditing ? "Guardar Modificaciones" : "Crear Comisión"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedComision?.nombre || "Detalle de Comisión"}
        maxWidth="md"
      >
        {selectedComision && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Código:</span>
                <span className="font-bold text-[#00205B]">{selectedComision.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel Pedagógico:</span>
                <span className="font-semibold text-slate-800">
                  {selectedComision.nivelNombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Turno:</span>
                <Badge variant="navy" size="sm">
                  {selectedComision.turno}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Días y Horarios:</span>
                <span className="font-semibold">{selectedComision.diasHorarios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aula Física:</span>
                <span className="font-bold">{selectedComision.aulaFisica}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ocupación:</span>
                <span className="font-bold text-[#00205B]">
                  {selectedComision.cupoOcupado} alumnos de {selectedComision.cupoMaximo} vacantes
                </span>
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
        title="¿Eliminar Comisión?"
        description={`¿Confirma que desea eliminar la comisión "${selectedComision?.nombre}"?`}
        confirmText="Eliminar Comisión"
      />
    </div>
  );
}
