"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalData } from "@/features/core/DataContext";
import { Comision } from "@/features/comisiones/types";
import { TurnoType } from "@/features/niveles-turnos/types";
import { checkScheduleConflict } from "@/features/aulas/scheduleUtils";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import {
  AlertTriangle,
  DoorOpen,
  Users,
  Clock,
  Tv,
  Presentation,
  BookOpen,
  Wind,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function GradosParalelosPage(): React.ReactElement {
  const { comisiones, nivelesTurnos, aulas, addComision, updateComision, deleteComision } =
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
  const [aulaId, setAulaId] = useState(aulas[0]?.id || "aula-1");
  const [aulaFisica, setAulaFisica] = useState("Aula 1");
  const [cupoMaximo, setCupoMaximo] = useState(18);
  const [activo, setActivo] = useState(true);

  // Selected Aula Object
  const selectedAulaObj = useMemo(
    () => aulas.find((a) => a.id === aulaId || a.nombre === aulaFisica),
    [aulas, aulaId, aulaFisica]
  );

  // Real-time Schedule Conflict Detection
  const conflictResult = useMemo(() => {
    return checkScheduleConflict(
      aulaId,
      diasHorarios,
      isEditing && selectedComision ? selectedComision.id : undefined,
      comisiones
    );
  }, [aulaId, diasHorarios, isEditing, selectedComision, comisiones]);

  const isExceedingCapacity = useMemo(() => {
    if (!selectedAulaObj) return false;
    return cupoMaximo > selectedAulaObj.capacidadMaxima;
  }, [cupoMaximo, selectedAulaObj]);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedComision(null);
    setCodigo(`COM-${Date.now().toString().slice(-4)}`);
    setNombre("");
    setNivelId(nivelesTurnos[0]?.id || "niv-3");
    setTurno("Tarde");
    setDiasHorarios("Lunes y Miércoles 16:30 - 18:00 hs");
    const defaultAula = aulas[0];
    setAulaId(defaultAula?.id || "aula-1");
    setAulaFisica(defaultAula?.nombre || "Aula 1 (Planta Baja)");
    setCupoMaximo(defaultAula?.capacidadMaxima || 18);
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
    const matchedAula = aulas.find((a) => a.id === item.aulaId || a.nombre === item.aulaFisica);
    setAulaId(matchedAula?.id || item.aulaId || aulas[0]?.id || "aula-1");
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
    if (conflictResult.hasConflict) {
      alert("No se puede guardar la comisión porque existe una superposición de horarios en el aula seleccionada.");
      return;
    }

    const nivelObj = nivelesTurnos.find((n) => n.id === nivelId);
    const nivelNombre = nivelObj ? nivelObj.nombre : "Nivel General";
    const aulaObj = aulas.find((a) => a.id === aulaId);
    const resolvedAulaNombre = aulaObj ? aulaObj.nombre : aulaFisica;

    if (isEditing && selectedComision) {
      updateComision({
        ...selectedComision,
        codigo,
        nombre,
        nivelId,
        nivelNombre,
        turno,
        diasHorarios,
        aulaId,
        aulaFisica: resolvedAulaNombre,
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
        aulaId,
        aulaFisica: resolvedAulaNombre,
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
      header: "Aula e Instrumentos",
      cell: (item) => {
        const aulaObj = aulas.find((a) => a.id === item.aulaId || a.nombre === item.aulaFisica);
        return (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-[#00205B]" />
              {item.aulaFisica}
            </span>
            {aulaObj && aulaObj.instrumentosDidacticos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {aulaObj.instrumentosDidacticos.slice(0, 2).map((inst) => (
                  <span
                    key={inst}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-[#00205B] font-medium"
                  >
                    {inst.split("/")[0].trim()}
                  </span>
                ))}
                {aulaObj.instrumentosDidacticos.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-semibold self-center">
                    +{aulaObj.instrumentosDidacticos.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Días y Horarios Semanales"
                value={diasHorarios}
                onChange={(e) => setDiasHorarios(e.target.value)}
                placeholder="ej: Lunes y Miércoles 16:30 - 18:00 hs"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Formato sugerido: [Días] [Horario inicio] - [Horario fin] hs
              </span>
            </div>

            <div>
              <Select
                label="Aula Física Asignada (Capacidad e Instrumentos)"
                value={aulaId}
                onChange={(e) => {
                  const newAulaId = e.target.value;
                  setAulaId(newAulaId);
                  const found = aulas.find((a) => a.id === newAulaId);
                  if (found) {
                    setAulaFisica(found.nombre);
                    if (cupoMaximo > found.capacidadMaxima) {
                      setCupoMaximo(found.capacidadMaxima);
                    }
                  }
                }}
                options={aulas.map((a) => ({
                  value: a.id,
                  label: `${a.nombre} (Capacidad: ${a.capacidadMaxima} cupos) - ${a.ubicacion}`,
                }))}
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Vinculada al inventario de infraestructura escolar.
              </span>
            </div>
          </div>

          {/* Ficha rápida del aula seleccionada */}
          {selectedAulaObj && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#00205B] flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5" />
                  Atributos de {selectedAulaObj.nombre}:
                </span>
                <span className="font-extrabold text-[#00205B]">
                  Capacidad Física: {selectedAulaObj.capacidadMaxima} alumnos
                </span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedAulaObj.instrumentosDidacticos.map((inst) => (
                  <span
                    key={inst}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-blue-200 text-slate-700 text-[10px] font-semibold"
                  >
                    ✓ {inst}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detección en Tiempo Real de Superposición Horaria */}
          {conflictResult.hasConflict && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">¡Conflicto de Superposición en el Aula!</span>
                <span className="mt-0.5 block">{conflictResult.conflictDetails}</span>
                <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                  Modifique los días/horarios o asigne otra aula física para poder guardar.
                </span>
              </div>
            </div>
          )}

          {/* Advertencia si el cupo supera la capacidad del aula */}
          {isExceedingCapacity && selectedAulaObj && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Atención:</strong> El cupo ingresado ({cupoMaximo}) supera la capacidad física máxima del aula ({selectedAulaObj.capacidadMaxima} cupos).
              </span>
            </div>
          )}

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
            <Button
              type="submit"
              variant="coral"
              size="sm"
              disabled={conflictResult.hasConflict}
              className="font-bold shadow-xs disabled:opacity-50"
            >
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
