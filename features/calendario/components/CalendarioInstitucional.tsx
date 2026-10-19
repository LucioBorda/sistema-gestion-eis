"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalData } from "@/features/core/DataContext";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Flag,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  Star,
  UserCheck,
  Filter,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type CategoriaEvento =
  | "patria"
  | "halloween"
  | "anglia"
  | "examen"
  | "reunion"
  | "acto"
  | "nivelatorio";

export interface EventoInstitucional {
  id: string;
  titulo: string;
  categoria: CategoriaEvento;
  categoriaLabel: string;
  fecha: string; // YYYY-MM-DD
  hora?: string;
  lugar?: string;
  participantes?: string;
  descripcion: string;
  postulanteId?: string;
  postulanteDni?: string;
  postulanteNivel?: string;
}

// Eventos institucionales canónicos del Ciclo Lectivo EIS Institute
const EVENTOS_FIJOS_INSTITUCIONALES: EventoInstitucional[] = [
  // --- OCTUBRE 2026 ---
  {
    id: "evt-oct-10",
    titulo: "Reunión de Coordinación Pedagógica",
    categoria: "reunion",
    categoriaLabel: "Reunión de Personal",
    fecha: "2026-10-10",
    hora: "13:30 hs",
    lugar: "Sala de Profesores",
    participantes: "Directora Lic. Patricia Valenzuela y Docentes Titulares",
    descripcion:
      "Alineación de criterios para corrección de tests de nivel y preparación de exámenes cuatrimestrales de 2º ciclo.",
  },
  {
    id: "evt-oct-12",
    titulo: "Día del Respeto a la Diversidad Cultural",
    categoria: "patria",
    categoriaLabel: "Fecha Patria / Feriado",
    fecha: "2026-10-12",
    lugar: "Nacional",
    participantes: "Toda la comunidad escolar",
    descripcion:
      "Feriado Nacional oficial. Sin actividad administrativa ni presencial en sede.",
  },
  {
    id: "evt-oct-15",
    titulo: "Cierre de Inscripciones Anglia Examinations",
    categoria: "anglia",
    categoriaLabel: "Eventos Anglia",
    fecha: "2026-10-15",
    hora: "20:00 hs",
    lugar: "Secretaría General",
    participantes: "Candidatos y Secretaría",
    descripcion:
      "Fecha límite para el envío de listas de aspirantes al Centro Examinador Oficial Anglia AR-ENS-084.",
  },
  {
    id: "evt-oct-24",
    titulo: "Cierre de 2º Parcial (Children & Juniors)",
    categoria: "examen",
    categoriaLabel: "Exámenes 2º Ciclo",
    fecha: "2026-10-24",
    hora: "Horario de cursada",
    lugar: "Aulas de comisiones",
    participantes: "Alumnos de Children 1-3 y Juniors 1-4",
    descripcion:
      "Evaluación escrita correspondiente al cierre del segundo cuatrimestre formal.",
  },
  {
    id: "evt-oct-28",
    titulo: "Examen Integrador de 2º Ciclo (Adults)",
    categoria: "examen",
    categoriaLabel: "Exámenes 2º Ciclo",
    fecha: "2026-10-28",
    hora: "19:00 a 21:00 hs",
    lugar: "Comisiones Adultos A y B",
    participantes: "Alumnos Adultos",
    descripcion:
      "Examen integrador de producción escrita, escucha activa y gramática comunicativa.",
  },
  {
    id: "evt-oct-31",
    titulo: "Halloween EIS Spooktacular & Costume Contest",
    categoria: "halloween",
    categoriaLabel: "Halloween & Cultura",
    fecha: "2026-10-31",
    hora: "17:30 a 20:30 hs",
    lugar: "Sede Central La Paz Nº 525 (Patio y Aulas Temáticas)",
    participantes: "Alumnos de todos los niveles, docentes y familias",
    descripcion:
      "Tradicional festejo cultural de Halloween: concurso de disfraces en inglés, trick or treat institucional, juegos temáticos de vocabulario y entrega de premios.",
  },

  // --- NOVIEMBRE 2026 ---
  {
    id: "evt-nov-07",
    titulo: "Reunión de Docentes: Protocolos Anglia",
    categoria: "reunion",
    categoriaLabel: "Reunión de Personal",
    fecha: "2026-11-07",
    hora: "13:00 hs",
    lugar: "Sala de Conferencias",
    participantes: "Profesores titulares de comisiones Anglia",
    descripcion:
      "Instrucciones de logística y protocolos para las sesiones de examen internacional.",
  },
  {
    id: "evt-nov-14",
    titulo: "Sesión Escrita Anglia Examinations (Oficial)",
    categoria: "anglia",
    categoriaLabel: "Eventos Anglia",
    fecha: "2026-11-14",
    hora: "09:00 a 13:00 hs",
    lugar: "Sede Central - Aulas 1 a 4",
    participantes: "Todos los candidatos inscriptos a certificación internacional",
    descripcion:
      "Toma de exámenes escritos de inglés general y comercial bajo supervisión de Anglia Examinations England.",
  },
  {
    id: "evt-nov-18",
    titulo: "Sesión Oral / Speaking Tests Anglia",
    categoria: "anglia",
    categoriaLabel: "Eventos Anglia",
    fecha: "2026-11-18",
    hora: "14:00 a 19:30 hs",
    lugar: "Salas de Exámenes Orales",
    participantes: "Candidatos Anglia con Moderador Externo Oficial de UK",
    descripcion:
      "Entrevistas individuales y en parejas para acreditación de competencia oral internacional.",
  },
  {
    id: "evt-nov-20",
    titulo: "Día de la Soberanía Nacional",
    categoria: "patria",
    categoriaLabel: "Fecha Patria / Feriado",
    fecha: "2026-11-20",
    lugar: "Nacional",
    participantes: "Toda la comunidad escolar",
    descripcion:
      "Feriado Nacional oficial. Conmemoración de la Batalla de la Vuelta de Obligado.",
  },
  {
    id: "evt-nov-21",
    titulo: "Reunión de Padres y Familias (Children)",
    categoria: "reunion",
    categoriaLabel: "Reunión de Familias",
    fecha: "2026-11-21",
    hora: "18:30 hs",
    lugar: "Salón de Actos",
    participantes: "Padres y tutores de niveles iniciales",
    descripcion:
      "Entrega de devoluciones pedagógicas e informes de progreso del ciclo lectivo.",
  },
  {
    id: "evt-nov-30",
    titulo: "Inicio de Exámenes Finales Regulares",
    categoria: "examen",
    categoriaLabel: "Exámenes 2º Ciclo",
    fecha: "2026-11-30",
    hora: "Semana completa",
    lugar: "Todas las comisiones",
    participantes: "Alumnos regulares",
    descripcion:
      "Evaluaciones finales para acreditación de pase de nivel anual.",
  },

  // --- DICIEMBRE 2026 ---
  {
    id: "evt-dic-08",
    titulo: "Inmaculada Concepción de María",
    categoria: "patria",
    categoriaLabel: "Fecha Patria / Feriado",
    fecha: "2026-12-08",
    lugar: "Nacional",
    participantes: "Toda la comunidad escolar",
    descripcion: "Feriado Nacional oficial.",
  },
  {
    id: "evt-dic-11",
    titulo: "Cierre de Actas Definitivas de Calificación",
    categoria: "examen",
    categoriaLabel: "Exámenes 2º Ciclo",
    fecha: "2026-12-11",
    hora: "19:00 hs",
    lugar: "Secretaría Académica",
    participantes: "Cuerpo Docente y Dirección",
    descripcion:
      "Firma y cierre oficial de libros de calificaciones del Ciclo Lectivo 2026.",
  },
  {
    id: "evt-dic-18",
    titulo: "Acto de Colación, Entrega de Diplomas y Open Day",
    categoria: "acto",
    categoriaLabel: "Acto Institucional",
    fecha: "2026-12-18",
    hora: "18:30 hs",
    lugar: "Salón de Actos Institucional",
    participantes: "Egresados, distinguidos, directivos, familias y docentes",
    descripcion:
      "Ceremonia anual de colación de grado, entrega de diplomas institucionales y Anglia, y muestra de proyectos estudiantiles.",
  },
];

export const CalendarioInstitucional: React.FC = () => {
  const { postulantes } = useGlobalData();

  // Calendar month state (defaults to October 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = Octubre
  const [selectedFilter, setSelectedFilter] = useState<string>("TODOS");
  const [selectedEvent, setSelectedEvent] = useState<EventoInstitucional | null>(null);

  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Merge fixed institutional events with live candidates scheduled for level tests
  const todosLosEventos: EventoInstitucional[] = useMemo(() => {
    const eventos: EventoInstitucional[] = [...EVENTOS_FIJOS_INSTITUCIONALES];

    // Add applicants with scheduled test dates
    postulantes.forEach((p) => {
      if (p.fechaAgendadaTest) {
        eventos.push({
          id: `test-${p.id}`,
          titulo: `Test: ${p.nombreCompleto}`,
          categoria: "nivelatorio",
          categoriaLabel: "Test Nivelatorio",
          fecha: p.fechaAgendadaTest,
          hora: p.horaAgendadaTest || "18:00 hs",
          lugar: "Gabinete de Evaluación Presencial",
          participantes: `${p.nombreCompleto} (DNI ${p.dni}) - ${p.edad} años (${p.franjaEtaria})`,
          descripcion: `Evaluación de nivelación presencial agendada en secretaría. Aspirante: ${p.nombreCompleto}. Tel: ${p.telefono}.`,
          postulanteId: p.id,
          postulanteDni: p.dni,
          postulanteNivel: p.resultadoCorreccion?.nivelAsignado || "Pendiente de Dictamen",
        });
      }
    });

    return eventos;
  }, [postulantes]);

  // Filter events by selected category
  const eventosFiltrados = useMemo(() => {
    if (selectedFilter === "TODOS") return todosLosEventos;
    return todosLosEventos.filter((e) => e.categoria === selectedFilter);
  }, [todosLosEventos, selectedFilter]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // Octubre
  };

  // Compute days in month and padding
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map events by day number
  const eventsByDay = useMemo(() => {
    const map: Record<number, EventoInstitucional[]> = {};
    eventosFiltrados.forEach((e) => {
      const parts = e.fecha.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (year === currentYear && month === currentMonth) {
          if (!map[day]) map[day] = [];
          map[day].push(e);
        }
      }
    });
    return map;
  }, [eventosFiltrados, currentYear, currentMonth]);

  // Style helper for event chips
  const getEventChipStyle = (cat: CategoriaEvento) => {
    switch (cat) {
      case "patria":
        return "bg-sky-100 text-sky-900 border border-sky-300 hover:bg-sky-200";
      case "halloween":
        return "bg-amber-100 text-amber-950 border border-amber-400 hover:bg-amber-200 font-extrabold";
      case "anglia":
        return "bg-indigo-100 text-indigo-950 border border-indigo-300 hover:bg-indigo-200";
      case "examen":
        return "bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200";
      case "reunion":
        return "bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200";
      case "acto":
        return "bg-rose-100 text-rose-950 border border-rose-300 hover:bg-rose-200";
      case "nivelatorio":
        return "bg-[#00205B] text-white border border-[#00153D] hover:bg-[#0C3B8C]";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200";
    }
  };

  const getEventIcon = (cat: CategoriaEvento) => {
    switch (cat) {
      case "patria":
        return <Flag className="w-2.5 h-2.5 shrink-0 opacity-80" />;
      case "halloween":
        return <Sparkles className="w-2.5 h-2.5 shrink-0 text-amber-600" />;
      case "anglia":
        return <Award className="w-2.5 h-2.5 shrink-0 text-indigo-700" />;
      case "examen":
        return <GraduationCap className="w-2.5 h-2.5 shrink-0 text-emerald-700" />;
      case "reunion":
        return <Users className="w-2.5 h-2.5 shrink-0 text-purple-700" />;
      case "acto":
        return <Star className="w-2.5 h-2.5 shrink-0 text-rose-600" />;
      case "nivelatorio":
        return <Clock className="w-2.5 h-2.5 shrink-0 text-[#E63956]" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-7">
      {/* Google Calendar Style Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00205B] flex items-center justify-center font-black shadow-2xs border border-blue-200/80">
            <CalendarDays className="w-6 h-6 text-[#00205B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#00205B] tracking-tight">
                {mesesNombres[currentMonth]} {currentYear}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#00205B] text-xs font-bold border border-blue-200">
                {Object.values(eventsByDay).flat().length} actividades este mes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calendario oficial integral: fechas patrias, Halloween, sesiones Anglia, exámenes de 2º ciclo, reuniones, actos y tests nivelatorios
            </p>
          </div>
        </div>

        {/* Navigation Controls like Google Calendar */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            Hoy
          </button>
          <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mes Anterior"
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              title="Mes Siguiente"
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>
        {[
          { key: "TODOS", label: "Todos los eventos" },
          { key: "patria", label: "Fechas Patrias / Feriados" },
          { key: "halloween", label: "Halloween & Cultura" },
          { key: "anglia", label: "Eventos Anglia" },
          { key: "examen", label: "Exámenes 2º Ciclo" },
          { key: "reunion", label: "Reuniones de Personal" },
          { key: "acto", label: "Actos Escolares" },
          { key: "nivelatorio", label: "Tests Nivelatorios" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setSelectedFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === f.key
                ? "bg-[#00205B] text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Google Calendar Monthly Grid */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2.5">
          {diasSemana.map((dia, idx) => (
            <div
              key={dia}
              className={idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-700"}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Calendar days grid (7 cols) */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[420px]">
          {/* Leading blank days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="bg-slate-50/40 p-2 min-h-[90px]" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayEvents = eventsByDay[dayNum] || [];
            const isToday = currentYear === 2026 && currentMonth === 9 && dayNum === 19;

            return (
              <div
                key={`day-${dayNum}`}
                className={`p-2 min-h-[95px] flex flex-col justify-between transition-colors ${
                  isToday ? "bg-blue-50/40" : "hover:bg-slate-50/60"
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-[#00205B] text-white shadow-xs font-black"
                        : "text-slate-700"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-[#E63956]">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Chips (Google Calendar Style) */}
                <div className="space-y-1 mt-1 flex-1">
                  {dayEvents.map((ev) => {
                    const isSelected = selectedEvent?.id === ev.id;
                    const chipStyle = getEventChipStyle(ev.categoria);

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left px-2 py-1 rounded-md text-[11px] truncate transition-all flex items-center gap-1.5 shadow-2xs ${chipStyle} ${
                          isSelected ? "ring-2 ring-[#00205B] shadow-sm scale-[1.02]" : ""
                        }`}
                        title={`${ev.hora ? ev.hora + " - " : ""}${ev.titulo}`}
                      >
                        {getEventIcon(ev.categoria)}
                        {ev.hora && (
                          <span className="font-mono text-[10px] opacity-75 shrink-0">
                            {ev.hora.split(" ")[0]}
                          </span>
                        )}
                        <span className="truncate font-semibold">{ev.titulo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Floating Details Card (Google Calendar Details Style) */}
      {selectedEvent && (
        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300/80 animate-in fade-in duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detalle del Evento en Calendario:
              </span>
              <Badge
                variant={
                  selectedEvent.categoria === "halloween"
                    ? "warning"
                    : selectedEvent.categoria === "anglia"
                    ? "navy"
                    : selectedEvent.categoria === "examen"
                    ? "success"
                    : selectedEvent.categoria === "acto"
                    ? "coral"
                    : selectedEvent.categoria === "patria"
                    ? "info"
                    : "default"
                }
                size="sm"
              >
                {selectedEvent.categoriaLabel}
              </Badge>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {selectedEvent.titulo}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold text-[#00205B]">
                <CalendarIcon className="w-4 h-4 text-[#E63956]" />
                {selectedEvent.fecha} {selectedEvent.hora ? `· ${selectedEvent.hora}` : ""}
              </span>
              {selectedEvent.lugar && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedEvent.lugar}
                </span>
              )}
              {selectedEvent.participantes && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {selectedEvent.participantes}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {selectedEvent.descripcion}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {selectedEvent.postulanteId && (
              <Link href={`/admin/admisiones`}>
                <Button variant="coral" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Ver en Admisiones
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEvent(null)}
              className="text-slate-600"
            >
              Cerrar Detalle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
