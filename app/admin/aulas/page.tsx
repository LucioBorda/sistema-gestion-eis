"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalData } from "@/features/core/DataContext";
import { Aula, EstadoAula } from "@/features/aulas/types";
import { INSTRUMENTOS_DISPONIBLES } from "@/features/aulas/mocks";
import { parseScheduleString } from "@/features/aulas/scheduleUtils";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import {
  DoorOpen,
  Tv,
  Presentation,
  BookOpen,
  Wind,
  Volume2,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  Layers,
  Sparkles,
  School,
  Calendar,
  Grid,
  FileSpreadsheet,
} from "lucide-react";

export default function AulasPage(): React.ReactElement {
  const { aulas, comisiones, addAula, updateAula, deleteAula } = useGlobalData();

  const [activeTab, setActiveTab] = useState<"fichas" | "grilla" | "tabla">("fichas");
  const [selectedAulaFilter, setSelectedAulaFilter] = useState<string>("todas");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [capacidadMaxima, setCapacidadMaxima] = useState(18);
  const [horarioInicio, setHorarioInicio] = useState("16:00");
  const [horarioFin, setHorarioFin] = useState("21:30");
  const [instrumentos, setInstrumentos] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoAula>("Disponible");
  const [observaciones, setObservaciones] = useState("");

  // Helper to get commissions assigned to an aula
  const getComisionesForAula = (aula: Aula) => {
    return comisiones.filter(
      (c) =>
        c.aulaId === aula.id ||
        c.aulaFisica.toLowerCase().includes(aula.nombre.toLowerCase().slice(0, 6)) ||
        c.aulaFisica.toLowerCase().includes(aula.codigo.toLowerCase())
    );
  };

  // KPIs
  const totalAulas = aulas.length;
  const capacidadTotal = useMemo(
    () => aulas.reduce((acc, a) => acc + a.capacidadMaxima, 0),
    [aulas]
  );
  const aulasTech = useMemo(
    () =>
      aulas.filter((a) =>
        a.instrumentosDidacticos.some((inst) =>
          inst.includes("Smart TV") || inst.includes("Proyector") || inst.includes("Multimedia")
        )
      ).length,
    [aulas]
  );
  const totalComisionesEnAulas = comisiones.filter((c) => c.activo).length;

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedAula(null);
    setCodigo(`AULA-0${aulas.length + 1}`);
    setNombre("");
    setUbicacion("Planta Alta - Sector Central");
    setCapacidadMaxima(18);
    setHorarioInicio("16:00");
    setHorarioFin("21:30");
    setInstrumentos([
      "Smart TV 55\" / Pantalla Interactiva",
      "Pizarra Blanca Magnética",
      "Climatización Frío/Calor",
    ]);
    setEstado("Disponible");
    setObservaciones("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Aula) => {
    setIsEditing(true);
    setSelectedAula(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setUbicacion(item.ubicacion);
    setCapacidadMaxima(item.capacidadMaxima);
    setHorarioInicio(item.horarioInicio || "16:00");
    setHorarioFin(item.horarioFin || "21:30");
    setInstrumentos([...item.instrumentosDidacticos]);
    setEstado(item.estado);
    setObservaciones(item.observaciones || "");
    setModalOpen(true);
  };

  const handleOpenDetail = (item: Aula) => {
    setSelectedAula(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: Aula) => {
    setSelectedAula(item);
    setConfirmDeleteOpen(true);
  };

  const handleToggleInstrumento = (inst: string) => {
    setInstrumentos((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) return;

    if (isEditing && selectedAula) {
      updateAula({
        ...selectedAula,
        codigo,
        nombre,
        ubicacion,
        capacidadMaxima: Number(capacidadMaxima),
        horarioInicio,
        horarioFin,
        instrumentosDidacticos: instrumentos,
        estado,
        observaciones,
      });
    } else {
      const newAula: Aula = {
        id: `aula-${Date.now()}`,
        codigo,
        nombre,
        ubicacion,
        capacidadMaxima: Number(capacidadMaxima),
        horarioInicio,
        horarioFin,
        diasPermitidos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        instrumentosDidacticos: instrumentos,
        estado,
        observaciones,
      };
      addAula(newAula);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedAula) {
      deleteAula(selectedAula.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "aulas_instalaciones_eis",
      [
        { header: "Código", accessor: "codigo" },
        { header: "Nombre del Aula", accessor: "nombre" },
        { header: "Ubicación", accessor: "ubicacion" },
        { header: "Capacidad Máxima", accessor: "capacidadMaxima" },
        { header: "Instrumentos Didácticos", accessor: (a) => a.instrumentosDidacticos.join("; ") },
        { header: "Estado", accessor: "estado" },
        { header: "Observaciones", accessor: (a) => a.observaciones || "-" },
      ],
      aulas
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Padrón Oficial de Aulas, Capacidad e Instrumentos Didácticos - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Aula</th>
            <th>Ubicación</th>
            <th>Capacidad</th>
            <th>Instrumentos Didácticos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${aulas
            .map(
              (a) => `
            <tr>
              <td><strong>${a.codigo}</strong></td>
              <td>${a.nombre}</td>
              <td>${a.ubicacion}</td>
              <td>${a.capacidadMaxima} cupos</td>
              <td>${a.instrumentosDidacticos.join(", ")}</td>
              <td>${a.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón de Aulas e Instalaciones - EIS Institute", htmlBody);
  };

  // Icon mapping helper for instruments
  const getInstrumentIcon = (inst: string) => {
    if (inst.includes("TV")) return <Tv className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (inst.includes("Proyector"))
      return <Presentation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    if (inst.includes("Biblioteca"))
      return <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (inst.includes("Climatización"))
      return <Wind className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
    if (inst.includes("Audio"))
      return <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    if (inst.includes("Notebooks"))
      return <Laptop className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    return <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  };

  // Columns for DataTable tab
  const columns: ColumnDef<Aula>[] = [
    {
      id: "codigo",
      header: "Código",
      accessorKey: "codigo",
      sortable: true,
      className: "w-28 font-bold text-[#00205B]",
    },
    {
      id: "nombre",
      header: "Aula / Espacio",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombre}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" /> {item.ubicacion}
          </span>
        </div>
      ),
    },
    {
      id: "capacidad",
      header: "Capacidad Máx.",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">
            {item.capacidadMaxima} alumnos
          </span>
          <span className="text-[10px] text-slate-400">Cupos físicos</span>
        </div>
      ),
    },
    {
      id: "horario",
      header: "Banda Horaria de Uso",
      cell: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          {item.horarioInicio || "16:00"} - {item.horarioFin || "21:30"} hs
        </span>
      ),
    },
    {
      id: "instrumentos",
      header: "Instrumentos Didácticos",
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {item.instrumentosDidacticos.slice(0, 3).map((inst) => (
            <span
              key={inst}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
            >
              {getInstrumentIcon(inst)}
              <span className="truncate max-w-[130px]">{inst}</span>
            </span>
          ))}
          {item.instrumentosDidacticos.length > 3 && (
            <span className="text-[10px] text-slate-500 font-semibold self-center">
              +{item.instrumentosDidacticos.length - 3} más
            </span>
          )}
        </div>
      ),
    },
    {
      id: "comisiones",
      header: "Comisiones Cursando",
      cell: (item) => {
        const coms = getComisionesForAula(item);
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-[#00205B] block">
              {coms.length} comisión(es)
            </span>
            <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
              {coms.map((c) => c.nombre.split(" - ")[0]).join(", ") || "Sin comisiones"}
            </span>
          </div>
        );
      },
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge variant={item.estado === "Disponible" ? "success" : "warning"} size="sm">
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Institucional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#00205B] text-xs font-bold border border-blue-200 mb-1">
            <DoorOpen className="w-3.5 h-3.5 text-[#00205B]" />
            Estructura Académica · Infraestructura Físico-Didáctica
          </div>
          <h1 className="text-xl font-black text-[#00205B] tracking-tight">
            Aulas, Capacidad e Instrumentos Didácticos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión de cupos máximos, equipamiento multimedia y control de horarios para evitar superposiciones con Grados y Comisiones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="coral"
            size="sm"
            onClick={handleOpenNew}
            className="font-bold shadow-md shadow-[#E63956]/15"
            icon={<DoorOpen className="w-4 h-4" />}
          >
            Nueva Aula
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportExcel}>
            Exportar Excel
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportPdf}>
            Imprimir
          </Button>
        </div>
      </div>

      {/* 4 KPIs de Infraestructura */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Aulas Habilitadas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00205B] flex items-center justify-center">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{totalAulas}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Espacios activos en sede</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Capacidad Simultánea</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{capacidadTotal}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Cupos máximos en simultáneo</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Aulas Tech / Smart</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{aulasTech}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Con Smart TV o Proyector</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Comisiones Asignadas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{totalComisionesEnAulas}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Sin superposición horaria</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("fichas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "fichas"
                ? "bg-[#00205B] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Fichas e Instrumentos Didácticos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("grilla")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "grilla"
                ? "bg-[#00205B] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Grilla Semanal de Ocupación
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tabla")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "tabla"
                ? "bg-[#00205B] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Padrón en Tabla
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Vinculado dinámicamente con <strong>Grados / Comisiones</strong>
        </span>
      </div>

      {/* TAB 1: FICHAS DE AULAS CON INSTRUMENTOS */}
      {activeTab === "fichas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aulas.map((aula) => {
            const coms = getComisionesForAula(aula);
            return (
              <div
                key={aula.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center font-bold">
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">
                          {aula.codigo}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm tracking-tight leading-tight">
                          {aula.nombre}
                        </h3>
                      </div>
                    </div>
                    <Badge variant={aula.estado === "Disponible" ? "success" : "warning"} size="sm">
                      {aula.estado}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{aula.ubicacion}</span>
                  </p>

                  {/* Capacidad y Rango Horario */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Capacidad Alumnos:</span>
                      <span className="font-black text-[#00205B] text-sm mt-0.5">
                        {aula.capacidadMaxima} <span className="text-[10px] font-normal text-slate-400">cupos</span>
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Franja Horaria:
                      </span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 font-mono">
                        {aula.horarioInicio || "16:00"} a {aula.horarioFin || "21:30"} hs
                      </span>
                    </div>
                  </div>

                  {/* Instrumentos Didácticos */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Instrumentos Didácticos y Multimedia
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aula.instrumentosDidacticos.map((inst) => (
                        <span
                          key={inst}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-700 text-xs font-semibold"
                        >
                          {getInstrumentIcon(inst)}
                          <span>{inst}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comisiones Cursando en el Aula */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Comisiones Asignadas ({coms.length})
                    </span>
                    {coms.length > 0 ? (
                      <div className="space-y-1.5">
                        {coms.map((c) => (
                          <div
                            key={c.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block text-[11px]">
                                {c.nombre}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {c.diasHorarios}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {c.cupoOcupado}/{c.cupoMaximo}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic block py-1">
                        Aula libre sin comisiones regulares asignadas
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(aula)}>
                    Ver Detalle
                  </Button>
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(aula)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(aula)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GRILLA SEMANAL DE OCUPACIÓN */}
      {activeTab === "grilla" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#00205B]">
                Grilla Semanal de Ocupación y Detección de Superposiciones
              </h3>
              <p className="text-xs text-slate-500">
                Visualice la disponibilidad de franjas horarias por aula para planificar nuevas comisiones sin colisiones
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Filtrar Aula:</label>
              <select
                value={selectedAulaFilter}
                onChange={(e) => setSelectedAulaFilter(e.target.value)}
                className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              >
                <option value="todas">-- Ver Todas las Aulas ({aulas.length}) --</option>
                {aulas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} ({a.capacidadMaxima} cupos)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grilla visual por aulas */}
          <div className="space-y-4">
            {aulas
              .filter((a) => selectedAulaFilter === "todas" || a.id === selectedAulaFilter)
              .map((aula) => {
                const coms = getComisionesForAula(aula);
                return (
                  <div key={aula.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#00205B] flex items-center justify-center font-bold">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{aula.nombre}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            {aula.ubicacion} · Capacidad: {aula.capacidadMaxima} cupos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {aula.instrumentosDidacticos.map((inst) => (
                          <span
                            key={inst}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold"
                          >
                            {getInstrumentIcon(inst)}
                            <span>{inst.split("/")[0].trim()}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bandas horarias del aula */}
                    {coms.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                        {coms.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{c.nombre}</span>
                              <Badge variant="navy" size="sm">
                                {c.turno}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono mt-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.diasHorarios}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Nivel: {c.nivelNombre.split(" ")[0]}</span>
                              <span className="font-bold text-slate-700">
                                {c.cupoOcupado} / {c.cupoMaximo} alumnos
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Aula completamente libre en todos los turnos. Lista para asignar nuevas comisiones.</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: TABLA DE DATOS TRADICIONAL */}
      {activeTab === "tabla" && (
        <DataTable
          title="Catálogo Oficial de Aulas y Espacios Físicos"
          subtitle="Listado con inventario de instrumentos didácticos, capacidad y comisiones"
          data={aulas}
          columns={columns}
          keyExtractor={(item) => item.id}
          onAddNew={handleOpenNew}
          addNewLabel="Nueva Aula"
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onView={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          initialPageSize={8}
        />
      )}

      {/* MODAL: CREAR / EDITAR AULA */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Aula e Instalación" : "Nueva Aula e Instalación Didáctica"}
        subtitle="Defina el código, ubicación, capacidad máxima de cupos e instrumentos didácticos asignados"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Código del Aula (ej: AULA-01, LAB-01)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <Input
              label="Nombre del Aula (ej: Aula 2 - Lab Multimedia)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ubicación Física en el Edificio"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="ej: Planta Alta - Sector Central"
              required
            />
            <Input
              label="Capacidad Máxima de Alumnos (Cupos)"
              type="number"
              value={capacidadMaxima}
              onChange={(e) => setCapacidadMaxima(Number(e.target.value))}
              required
            />
          </div>

          {/* Rango Horario de Uso */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Rango Horario Permitido para Clases:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {horarioInicio} a {horarioFin} hs
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Horario de Inicio / Apertura:
                </label>
                <input
                  type="time"
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Horario de Cierre / Fin:
                </label>
                <input
                  type="time"
                  value={horarioFin}
                  onChange={(e) => setHorarioFin(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Las comisiones que se asignen a esta aula deberán estar comprendidas dentro de esta franja.
            </span>
          </div>

          {/* Instrumentos didácticos toggle chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Instrumentos Didácticos y Equipamiento Tecnológico Disponible:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {INSTRUMENTOS_DISPONIBLES.map((inst) => {
                const isSelected = instrumentos.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleToggleInstrumento(inst)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-[#00205B] text-white border-[#00205B] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={isSelected ? "text-white" : ""}>{getInstrumentIcon(inst)}</div>
                    <span className="truncate">{inst}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Seleccione los instrumentos con los que cuenta el aula para que las comisiones los aprovechen pedagógicamente.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Estado Operativo del Aula"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoAula)}
              options={[
                { value: "Disponible", label: "Disponible para Clases" },
                { value: "En Mantenimiento", label: "En Mantenimiento / Reparación" },
              ]}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones Administrativas
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                placeholder="Detalles sobre conexiones, cerraduras, mantenimiento..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm" className="font-bold">
              {isEditing ? "Guardar Cambios" : "Crear Aula"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE DEL AULA */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedAula ? `${selectedAula.nombre} (${selectedAula.codigo})` : "Detalle del Aula"}
        maxWidth="md"
      >
        {selectedAula && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Código:</span>
                <span className="font-bold text-[#00205B]">{selectedAula.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Ubicación Física:</span>
                <span className="font-bold text-slate-800">{selectedAula.ubicacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Capacidad Máxima de Cupos:</span>
                <span className="font-black text-[#00205B] text-sm">
                  {selectedAula.capacidadMaxima} alumnos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Franja Horaria Habilitada:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedAula.horarioInicio || "16:00"} a {selectedAula.horarioFin || "21:30"} hs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Estado:</span>
                <Badge variant={selectedAula.estado === "Disponible" ? "success" : "warning"} size="sm">
                  {selectedAula.estado}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1.5">
                Instrumentos Didácticos Equipados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAula.instrumentosDidacticos.map((inst) => (
                  <span
                    key={inst}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-slate-800 text-xs font-semibold"
                  >
                    {getInstrumentIcon(inst)}
                    <span>{inst}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1.5">
                Comisiones Cursando en esta Aula:
              </span>
              {getComisionesForAula(selectedAula).length > 0 ? (
                <div className="space-y-2">
                  {getComisionesForAula(selectedAula).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{c.nombre}</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {c.diasHorarios} · Turno {c.turno}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        {c.cupoOcupado} / {c.cupoMaximo} cupos
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No hay comisiones asignadas a esta aula actualmente.</p>
              )}
            </div>

            {selectedAula.observaciones && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Observaciones:</span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  {selectedAula.observaciones}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
              <Button
                variant="coral"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenEdit(selectedAula);
                }}
              >
                Editar Aula
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
        title="¿Eliminar Registro de Aula?"
        description={`¿Confirma que desea eliminar el aula "${selectedAula?.nombre}"? Las comisiones asignadas deberán reubicarse.`}
        confirmText="Eliminar Aula"
      />
    </div>
  );
}
