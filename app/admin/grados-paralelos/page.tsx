"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalData } from "@/features/core/DataContext";
import { Comision } from "@/features/comisiones/types";
import { Aula } from "@/features/aulas/types";
import { TurnoType } from "@/features/niveles-turnos/types";
import {
  checkScheduleConflict,
  checkWithinAulaOperatingHours,
  parseScheduleString,
} from "@/features/aulas/scheduleUtils";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";
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
  Calendar,
  Grid,
  FileSpreadsheet,
  Printer,
  Plus,
  Pencil,
  School,
} from "lucide-react";

const DIAS_GRILLA = [
  { key: "lunes", label: "Lunes", short: "Lun" },
  { key: "martes", label: "Martes", short: "Mar" },
  { key: "miercoles", label: "Miércoles", short: "Mié" },
  { key: "jueves", label: "Jueves", short: "Jue" },
  { key: "viernes", label: "Viernes", short: "Vie" },
  { key: "sabado", label: "Sábado", short: "Sáb" },
];

const HORAS_GRILLA = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 09:00 a 21:00 hs

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const isComisionInAula = (c: Comision, aula: Aula) => {
  if (c.aulaId && c.aulaId === aula.id) return true;
  if (c.aulaFisica && aula.nombre) {
    const f1 = c.aulaFisica.toLowerCase().trim();
    const a1 = aula.nombre.toLowerCase().trim();
    if (f1 === a1) return true;
    if (f1.includes(aula.codigo.toLowerCase())) return true;
    if (a1.includes(f1.slice(0, 6))) return true;
  }
  return false;
};

export default function GradosParalelosPage(): React.ReactElement {
  const { comisiones, nivelesTurnos, aulas, addComision, updateComision, deleteComision } =
    useGlobalData();

  const [selectedAulaGridId, setSelectedAulaGridId] = useState<string>(aulas[0]?.id || "aula-1");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedComision, setSelectedComision] = useState<Comision | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nivelId, setNivelId] = useState(nivelesTurnos[0]?.id || "niv-jun1");
  const [turno, setTurno] = useState<TurnoType>("Tarde");
  const [diasHorarios, setDiasHorarios] = useState("");
  const [aulaId, setAulaId] = useState(aulas[0]?.id || "aula-1");
  const [aulaFisica, setAulaFisica] = useState("Aula 1");
  const [cupoMaximo, setCupoMaximo] = useState(18);
  const [activo, setActivo] = useState(true);

  // Selected Aula Object for form
  const selectedAulaObj = useMemo(
    () => aulas.find((a) => a.id === aulaId || a.nombre === aulaFisica),
    [aulas, aulaId, aulaFisica]
  );

  // Current Aula for Weekly Grid
  const currentGridAula = useMemo(() => {
    return aulas.find((a) => a.id === selectedAulaGridId) || aulas[0];
  }, [aulas, selectedAulaGridId]);

  // Commissions assigned to current grid aula
  const comisionesGridAula = useMemo(() => {
    if (!currentGridAula) return [];
    return comisiones.filter((c) => isComisionInAula(c, currentGridAula));
  }, [comisiones, currentGridAula]);

  // Total weekly booked hours in this aula
  const totalHorasSemanales = useMemo(() => {
    let totalMinutes = 0;
    comisionesGridAula.forEach((c) => {
      const parsed = parseScheduleString(c.diasHorarios);
      if (parsed.isValid && parsed.days.length > 0) {
        const duration = Math.max(0, parsed.endMinutes - parsed.startMinutes);
        totalMinutes += duration * parsed.days.length;
      }
    });
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [comisionesGridAula]);

  // Real-time Schedule Conflict Detection
  const conflictResult = useMemo(() => {
    return checkScheduleConflict(
      aulaId,
      diasHorarios,
      isEditing && selectedComision ? selectedComision.id : undefined,
      comisiones
    );
  }, [aulaId, diasHorarios, isEditing, selectedComision, comisiones]);

  // Real-time Operating Hours Range Check
  const rangeCheckResult = useMemo(() => {
    if (!selectedAulaObj) return { isWithinRange: true };
    return checkWithinAulaOperatingHours(
      diasHorarios,
      selectedAulaObj.horarioInicio,
      selectedAulaObj.horarioFin
    );
  }, [selectedAulaObj, diasHorarios]);

  const isExceedingCapacity = useMemo(() => {
    if (!selectedAulaObj) return false;
    return cupoMaximo > selectedAulaObj.capacidadMaxima;
  }, [cupoMaximo, selectedAulaObj]);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedComision(null);
    setCodigo(`COM-${Date.now().toString().slice(-4)}`);
    setNombre("");
    setNivelId(nivelesTurnos[0]?.id || "niv-jun1");
    setTurno("Tarde");
    setDiasHorarios("Lunes y Miércoles 16:30 - 18:00 hs");
    const targetAula = currentGridAula || aulas[0];
    setAulaId(targetAula?.id || "aula-1");
    setAulaFisica(targetAula?.nombre || "Aula 1 (Planta Baja)");
    setCupoMaximo(targetAula?.capacidadMaxima || 18);
    setActivo(true);
    setModalOpen(true);
  };

  const handleOpenNewForSlot = (targetAula: Aula, diaLabel: string, hora: number) => {
    setIsEditing(false);
    setSelectedComision(null);
    setCodigo(`COM-${Date.now().toString().slice(-4)}`);
    setNombre("");
    setNivelId(nivelesTurnos[0]?.id || "niv-jun1");

    // Auto-determine Turno based on hour
    const autoTurno: TurnoType = hora < 13 ? "Mañana" : hora < 18 ? "Tarde" : "Vespertino";
    setTurno(autoTurno);

    // Pre-fill schedule
    const horaInicioStr = `${hora.toString().padStart(2, "0")}:00`;
    const horaFinNum = hora + 1;
    const horaFinStr = horaFinNum <= 21 ? `${horaFinNum.toString().padStart(2, "0")}:30` : "21:30";
    setDiasHorarios(`${diaLabel} ${horaInicioStr} - ${horaFinStr} hs`);

    setAulaId(targetAula.id);
    setAulaFisica(targetAula.nombre);
    setCupoMaximo(targetAula.capacidadMaxima);
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

    if (!rangeCheckResult.isWithinRange) {
      alert(rangeCheckResult.details || "El horario excede la banda permitida para el aula.");
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
      {/* GRILLA SEMANAL INTERACTIVA POR AULA */}
      <div className="space-y-5">
          {/* 1. Selector de Aula Física */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#00205B] uppercase tracking-wider flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-[#00205B]" />
                Seleccionar Aula Física para Monitorear Disponibilidad:
              </label>
              <span className="text-xs text-slate-500">
                Haga clic en un aula para ver sus horarios ocupados y vacantes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {aulas.map((aula) => {
                const comsInAula = comisiones.filter((c) => isComisionInAula(c, aula));
                const isSelected = (currentGridAula?.id === aula.id);

                return (
                  <button
                    key={aula.id}
                    type="button"
                    onClick={() => setSelectedAulaGridId(aula.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer",
                      isSelected
                        ? "bg-[#00205B] text-white border-[#00205B] shadow-md ring-2 ring-[#00205B]/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                            isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-[#00205B]"
                          )}
                        >
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={cn(
                              "text-[10px] font-mono font-bold block",
                              isSelected ? "text-blue-200" : "text-slate-400"
                            )}
                          >
                            {aula.codigo}
                          </span>
                          <span className="font-bold text-xs tracking-tight line-clamp-1">
                            {aula.nombre}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                          isSelected
                            ? "bg-[#E63956] text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}
                      >
                        {comsInAula.length} com.
                      </span>
                    </div>

                    <div
                      className={cn(
                        "text-[11px] flex items-center justify-between pt-2 border-t",
                        isSelected ? "border-white/15 text-blue-100" : "border-slate-100 text-slate-500"
                      )}
                    >
                      <span>Capacidad: <strong>{aula.capacidadMaxima} cupos</strong></span>
                      <span className="truncate max-w-[120px]">{aula.ubicacion.split(" - ")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Banner de Información y Ocupación del Aula Seleccionada */}
          {currentGridAula && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#00205B] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black text-[#00205B]">
                        {currentGridAula.nombre}
                      </h2>
                      <Badge variant="navy" size="sm">
                        {currentGridAula.codigo}
                      </Badge>
                      <Badge variant={currentGridAula.estado === "Disponible" ? "success" : "warning"} size="sm">
                        {currentGridAula.estado}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentGridAula.ubicacion} · Capacidad máxima: <strong>{currentGridAula.capacidadMaxima} alumnos</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Stats Ocupación Semanal */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Carga Horaria Semanal
                      </span>
                      <span className="font-extrabold text-[#00205B]">
                        {totalHorasSemanales} hs ocupadas <span className="text-slate-400 font-normal">/ 72 hs</span>
                      </span>
                    </div>
                    <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00205B] h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((totalHorasSemanales / 72) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="coral"
                    size="sm"
                    onClick={() => {
                      handleOpenNew();
                      setAulaId(currentGridAula.id);
                      setAulaFisica(currentGridAula.nombre);
                      setCupoMaximo(currentGridAula.capacidadMaxima);
                    }}
                    icon={<Plus className="w-4 h-4" />}
                    className="shadow-sm shadow-[#E63956]/20 font-semibold text-xs"
                  >
                    + Asignar Comisión en este Aula
                  </Button>
                </div>
              </div>

              {/* Referencia de Colores / Turnos */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Turnos y Referencias:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-sky-200 border border-sky-400 inline-block" />
                    <span className="text-slate-700 font-medium">Turno Mañana (09 a 13 hs)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-200 border border-amber-400 inline-block" />
                    <span className="text-slate-700 font-medium">Turno Tarde (13 a 18 hs)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-indigo-200 border border-indigo-400 inline-block" />
                    <span className="text-slate-700 font-medium">Turno Vespertino (18 a 21 hs)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-400 inline-block" />
                    <span className="text-emerald-800 font-bold">Disponible (+ Clic para agendar)</span>
                  </div>
                </div>

                <span className="text-slate-400 text-[11px]">
                  💡 <em>Haga clic sobre cualquier horario disponible para crear una comisión directa</em>
                </span>
              </div>
            </div>
          )}

          {/* 3. La Grilla Horaria Semanal (Lunes a Sábado, 9:00 a 21:00 hs) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-3 w-28 border-r border-slate-200 text-center font-mono">
                      Horario
                    </th>
                    {DIAS_GRILLA.map((dia) => (
                      <th key={dia.key} className="py-3 px-3 border-r border-slate-200 last:border-r-0 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00205B]" />
                          <span>{dia.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {HORAS_GRILLA.map((hora) => {
                    const horaInicioStr = `${hora.toString().padStart(2, "0")}:00`;
                    const horaFinStr = `${(hora + 1).toString().padStart(2, "0")}:00`;
                    const slotStartMin = hora * 60;
                    const slotEndMin = (hora + 1) * 60;

                    return (
                      <tr key={hora} className="hover:bg-slate-50/30 transition-colors">
                        {/* Columna de Horario */}
                        <td className="py-2.5 px-3 border-r border-slate-200 bg-slate-50/50 text-center font-mono text-[11px] font-bold text-slate-600 align-middle">
                          <span className="block text-[#00205B]">{horaInicioStr}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">a {horaFinStr}</span>
                        </td>

                        {/* Columnas de Días (Lunes a Sábado) */}
                        {DIAS_GRILLA.map((dia) => {
                          // Filtrar comisiones asignadas a esta aula que se imparten en este día y horario
                          const comisionesEnHorario = comisionesGridAula.filter((c) => {
                            const parsed = parseScheduleString(c.diasHorarios);
                            if (!parsed.isValid) return false;
                            if (!parsed.days.includes(dia.key)) return false;
                            // Overlap
                            return parsed.startMinutes < slotEndMin && parsed.endMinutes > slotStartMin;
                          });

                          return (
                            <td
                              key={dia.key}
                              className="p-1.5 border-r border-slate-200 last:border-r-0 align-top min-w-[145px]"
                            >
                              {comisionesEnHorario.length > 0 ? (
                                <div className="space-y-1.5">
                                  {comisionesEnHorario.map((com) => {
                                    const parsed = parseScheduleString(com.diasHorarios);
                                    const isStart =
                                      parsed.startMinutes >= slotStartMin || hora === 9;

                                    // Theme according to Turno
                                    const turnoStyles =
                                      com.turno === "Mañana"
                                        ? "bg-sky-50/90 border-sky-300 text-sky-950 hover:border-sky-400"
                                        : com.turno === "Tarde"
                                        ? "bg-amber-50/90 border-amber-300 text-amber-950 hover:border-amber-400"
                                        : "bg-indigo-50/90 border-indigo-300 text-indigo-950 hover:border-indigo-400";

                                    const badgeStyles =
                                      com.turno === "Mañana"
                                        ? "bg-sky-100 text-sky-800 border-sky-200"
                                        : com.turno === "Tarde"
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : "bg-indigo-100 text-indigo-800 border-indigo-200";

                                    if (isStart) {
                                      return (
                                        <div
                                          key={com.id}
                                          className={cn(
                                            "p-2.5 rounded-xl border transition-all shadow-2xs hover:shadow-xs group cursor-pointer space-y-1.5",
                                            turnoStyles
                                          )}
                                          onClick={() => handleOpenDetail(com)}
                                        >
                                          <div className="flex items-center justify-between gap-1">
                                            <span
                                              className={cn(
                                                "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border",
                                                badgeStyles
                                              )}
                                            >
                                              {com.turno}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-slate-500">
                                              {com.codigo}
                                            </span>
                                          </div>

                                          <div>
                                            <h4 className="font-extrabold text-xs leading-tight tracking-tight">
                                              {com.nombre}
                                            </h4>
                                            <span className="text-[10px] text-slate-600 block truncate">
                                              {com.nivelNombre}
                                            </span>
                                          </div>

                                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/5 font-mono">
                                            <span className="flex items-center gap-1 font-semibold">
                                              <Clock className="w-3 h-3 opacity-60" />
                                              {parsed.isValid
                                                ? `${formatMinutes(parsed.startMinutes)} - ${formatMinutes(parsed.endMinutes)}`
                                                : com.diasHorarios}
                                            </span>
                                            <span className="flex items-center gap-0.5 font-bold">
                                              <Users className="w-3 h-3 opacity-60" />
                                              {com.cupoOcupado}/{com.cupoMaximo}
                                            </span>
                                          </div>

                                          <div className="pt-1 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEdit(com);
                                              }}
                                              className="p-1 rounded bg-white text-slate-700 hover:text-[#00205B] shadow-2xs text-[10px] font-semibold flex items-center gap-0.5"
                                            >
                                              <Pencil className="w-3 h-3" /> Editar
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    // Continuation block (spanning multiple hours)
                                    return (
                                      <div
                                        key={com.id}
                                        onClick={() => handleOpenDetail(com)}
                                        className="p-2 rounded-lg bg-slate-50/80 border border-dashed border-slate-300 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between gap-1 text-[10px]"
                                      >
                                        <div className="flex items-center gap-1 truncate font-medium">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#00205B]" />
                                          <span className="truncate">{com.nombre}</span>
                                        </div>
                                        <span className="font-mono text-[9px] text-slate-500 font-bold shrink-0">
                                          hasta {formatMinutes(parsed.endMinutes)} hs
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* Espacio Disponible (Completamente Libre) */
                                <button
                                  type="button"
                                  onClick={() => handleOpenNewForSlot(currentGridAula, dia.label, hora)}
                                  className="w-full h-full min-h-[58px] rounded-xl border border-dashed border-slate-200 bg-white hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-2xs transition-all group p-2 flex flex-col items-center justify-center text-center cursor-pointer"
                                >
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span>Disponible</span>
                                  </div>
                                  <span className="text-[10px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex items-center gap-0.5">
                                    <Plus className="w-3 h-3" /> Asignar
                                  </span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Lista Detallada de Comisiones Asignadas a esta Aula */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#00205B]">
                  Comisiones Activas en {currentGridAula?.nombre}
                </h3>
                <p className="text-xs text-slate-500">
                  Resumen de las {comisionesGridAula.length} comisiones registradas en este espacio físico
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#00205B] border border-blue-200">
                Total Alumnos: {comisionesGridAula.reduce((acc, c) => acc + c.cupoOcupado, 0)}
              </span>
            </div>

            {comisionesGridAula.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {comisionesGridAula.map((com) => (
                  <div
                    key={com.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge
                          variant={
                            com.turno === "Mañana" ? "info" : com.turno === "Tarde" ? "warning" : "navy"
                          }
                          size="sm"
                        >
                          {com.turno}
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {com.codigo}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{com.nombre}</h4>
                      <p className="text-[11px] text-slate-500">{com.nivelNombre}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{com.diasHorarios}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Ocupación:</span>
                        <span className="font-bold text-slate-800">
                          {com.cupoOcupado} / {com.cupoMaximo} alumnos
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDetail(com)}
                        className="text-xs px-2 py-1"
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(com)}
                        className="text-xs px-2 py-1"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(com)}
                        className="text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-700">
                  No hay comisiones asignadas a esta aula actualmente
                </p>
                <p className="text-[11px] text-slate-400">
                  El aula cuenta con 100% de disponibilidad de horarios de lunes a sábados (9 a 21 hs).
                </p>
                <Button
                  variant="coral"
                  size="sm"
                  onClick={() => {
                    handleOpenNew();
                    setAulaId(currentGridAula.id);
                    setAulaFisica(currentGridAula.nombre);
                    setCupoMaximo(currentGridAula.capacidadMaxima);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                  className="font-bold text-xs mt-2"
                >
                  Asignar Primera Comisión
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* PADRÓN EN TABLA TRADICIONAL */}
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
        maxWidth="xl"
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
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-blue-200/60">
                <span className="font-extrabold text-[#00205B]">
                  Capacidad Física: {selectedAulaObj.capacidadMaxima} alumnos
                </span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Habilitada: {selectedAulaObj.horarioInicio || "16:00"} a {selectedAulaObj.horarioFin || "21:30"} hs
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

          {/* Detección de Horario Fuera de Rango del Aula */}
          {!rangeCheckResult.isWithinRange && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Horario Fuera de la Franja del Aula</span>
                <span className="mt-0.5 block">{rangeCheckResult.details}</span>
                <span className="text-[11px] text-amber-700 font-semibold block mt-1">
                  Ajuste el horario dentro de la franja ({selectedAulaObj?.horarioInicio} a {selectedAulaObj?.horarioFin} hs) para poder guardar.
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
              disabled={conflictResult.hasConflict || !rangeCheckResult.isWithinRange}
              className="font-bold shadow-xs disabled:opacity-50 w-full sm:w-auto justify-center"
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
        maxWidth="lg"
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
        title="¿Eliminar Comisión?"
        description={`¿Confirma que desea eliminar la comisión "${selectedComision?.nombre}"?`}
        confirmText="Eliminar Comisión"
      />
    </div>
  );
}
