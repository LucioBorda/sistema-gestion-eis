"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { CursoOficial, CategoriaPrograma } from "@/features/cursos/types";
import { CURSOS_OFICIALES_EIS } from "@/features/cursos/mocks";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  Users,
  Award,
  Layers,
  Banknote,
  CreditCard,
  Calendar,
  CheckCircle2,
  ChevronRight,
  School,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function CursosOficialesPage(): React.ReactElement {
  const { cursos = CURSOS_OFICIALES_EIS } = useGlobalData();

  const [selectedCurso, setSelectedCurso] = useState<CursoOficial | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredCursos = cursos.filter((c) => {
    const matchesCat =
      selectedCategory === "TODOS" || c.categoria === selectedCategory;
    const matchesSearch =
      c.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.examenAngliaAsociado.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenDetail = (curso: CursoOficial) => {
    setSelectedCurso(curso);
    setDetailModalOpen(true);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "catalogo_19_cursos_eis_institute",
      [
        { header: "Nº", accessor: "numeroOrden" },
        { header: "Programa / Nivel", accessor: "nombre" },
        { header: "Categoría", accessor: "categoria" },
        { header: "Carga Horaria", accessor: "cargaHorariaTexto" },
        { header: "Franja Etaria", accessor: "franjaEtariaRecomendada" },
        { header: "Examen Anglia", accessor: "examenAngliaAsociado" },
        {
          header: "Arancel Efectivo Base",
          accessor: (c) => formatCurrency(c.arancelEfectivoBase),
        },
        {
          header: "Arancel Transferencia Base",
          accessor: (c) => formatCurrency(c.arancelTransferenciaBase),
        },
      ],
      filteredCursos
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Catálogo Oficial de los 19 Programas y Cargas Horarias - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Programa</th>
            <th>Carga Semanal</th>
            <th>Población / Edad</th>
            <th>Acreditación Anglia</th>
            <th>Arancel Efectivo</th>
            <th>Arancel Transferencia</th>
          </tr>
        </thead>
        <tbody>
          ${filteredCursos
            .map(
              (c) => `
            <tr>
              <td><strong>${c.numeroOrden}</strong></td>
              <td><strong>${c.nombre}</strong></td>
              <td>${c.cargaHorariaTexto}</td>
              <td>${c.franjaEtariaRecomendada}</td>
              <td>${c.examenAngliaAsociado}</td>
              <td>${formatCurrency(c.arancelEfectivoBase)}</td>
              <td>${formatCurrency(c.arancelTransferenciaBase)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Catálogo Oficial de Cursos EIS Institute", htmlBody);
  };

  const columns: ColumnDef<CursoOficial>[] = [
    {
      id: "orden",
      header: "#",
      accessorKey: "numeroOrden",
      sortable: true,
      className: "w-12 text-center font-bold text-slate-400",
    },
    {
      id: "nombre",
      header: "Programa Oficial",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-extrabold text-[#00205B] block text-sm tracking-tight">
            {item.nombre}
          </span>
          <span className="text-[11px] text-slate-500 font-medium line-clamp-1">
            {item.descripcion}
          </span>
        </div>
      ),
    },
    {
      id: "categoria",
      header: "Categoría",
      accessorKey: "categoria",
      cell: (item) => (
        <Badge
          variant={
            item.categoria === "Kinder / Inicial"
              ? "info"
              : item.categoria === "Children"
              ? "info"
              : item.categoria === "Juniors"
              ? "navy"
              : item.categoria === "Adults"
              ? "warning"
              : "coral"
          }
          size="sm"
        >
          {item.categoria}
        </Badge>
      ),
    },
    {
      id: "carga",
      header: "Carga Semanal",
      accessorKey: "cargaHorariaSemanal",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
          <Clock className="w-3.5 h-3.5 text-[#E63956]" />
          <span>{item.cargaHorariaTexto}</span>
        </div>
      ),
    },
    {
      id: "edad",
      header: "Edad / Destinatarios",
      accessorKey: "franjaEtariaRecomendada",
      cell: (item) => (
        <span className="text-xs text-slate-700 block max-w-xs truncate">
          {item.franjaEtariaRecomendada}
        </span>
      ),
    },
    {
      id: "anglia",
      header: "Certificación Anglia",
      accessorKey: "examenAngliaAsociado",
      cell: (item) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate max-w-[190px]">{item.examenAngliaAsociado}</span>
        </div>
      ),
    },
    {
      id: "arancel",
      header: "Arancel Base",
      cell: (item) => (
        <div className="text-xs">
          <div className="font-bold text-emerald-700 flex items-center gap-1">
            <Banknote className="w-3 h-3" />
            <span>{formatCurrency(item.arancelEfectivoBase)} (Ef.)</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>{formatCurrency(item.arancelTransferenciaBase)} (Transf.)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#00205B] text-xs font-bold border border-blue-200 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-[#E63956]" />
            Diseño Curricular Oficial EIS Institute
          </div>
          <h1 className="text-xl font-black text-[#00205B] tracking-tight">
            Catálogo Unificado de los 19 Programas Oficiales
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Estructura curricular con cargas horarias semanales certificadas, vinculación internacional con Anglia Examinations y matriz de aranceles escalonada por tramos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileText className="w-4 h-4 text-emerald-600" />}
          >
            Exportar Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPdf}
            icon={<BookOpen className="w-4 h-4" />}
          >
            Imprimir Catálogo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Programas Totales
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">19</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            100% Homologados Anglia
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Kinder & Children
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">8 cursos</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            2 hs semanales cada uno
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Adults Regular Track
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">6 niveles</span>
          <span className="text-[11px] text-[#E63956] font-semibold mt-0.5 block">
            3 hs semanales intensivas
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Especiales & Profesorado
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">2 programas</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            Profesorado (2h) · Conversation (1.5h)
          </span>
        </div>
      </div>

      {/* Table with Categories filter */}
      <DataTable
        title="Padrón Curricular de Cursos y Niveles"
        subtitle="19 programas desde Playgroup hasta Adults 6, Profesorado y Conversation"
        data={filteredCursos}
        columns={columns}
        keyExtractor={(item) => item.id}
        onView={handleOpenDetail}
        initialPageSize={19}
        extraFilters={
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            {["TODOS", "Kinder / Inicial", "Children", "Juniors", "Adults", "Profesorado / Especial"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#00205B] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        }
      />

      {/* MODAL: FICHA TÉCNICA DEL CURSO Y COMISIONES */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCurso ? `${selectedCurso.numeroOrden}. ${selectedCurso.nombre}` : "Detalle de Curso"}
        subtitle="Ficha curricular completa, bibliografía, aranceles y comisiones con cupos"
        maxWidth="lg"
      >
        {selectedCurso && (
          <div className="space-y-4 py-2 text-xs">
            {/* Top Overview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="navy" size="md">
                    {selectedCurso.categoria}
                  </Badge>
                  <span className="px-2.5 py-1 rounded bg-rose-50 text-[#E63956] font-bold text-xs flex items-center gap-1 border border-rose-200">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedCurso.cargaHorariaTexto}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Examen Anglia:</span>
                  <span className="font-bold text-slate-800">{selectedCurso.examenAngliaAsociado}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                {selectedCurso.descripcion}
              </p>

              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Edad recomendada:</strong> {selectedCurso.franjaEtariaRecomendada}
              </div>
            </div>

            {/* Aranceles Escalonados Box */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-bold text-[#00205B] text-xs flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                Cuadro de Costos Escalonados por Fecha y Método de Pago
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Días 1 al 10 (Base)</span>
                  <span className="font-bold text-emerald-700 block text-xs">
                    {formatCurrency(selectedCurso.arancelEfectivoBase)}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block">
                    {formatCurrency(selectedCurso.arancelTransferenciaBase)} (Trf)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-amber-700 block font-semibold">Días 11 al 19 (+10%)</span>
                  <span className="font-bold text-slate-800 block text-xs">
                    {formatCurrency(Math.round(selectedCurso.arancelEfectivoBase * 1.1))}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block">
                    {formatCurrency(Math.round(selectedCurso.arancelTransferenciaBase * 1.1))} (Trf)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-orange-700 block font-semibold">Días 20 al fin (+20%)</span>
                  <span className="font-bold text-slate-800 block text-xs">
                    {formatCurrency(Math.round(selectedCurso.arancelEfectivoBase * 1.2))}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block">
                    {formatCurrency(Math.round(selectedCurso.arancelTransferenciaBase * 1.2))} (Trf)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-200 bg-rose-50/50">
                  <span className="text-[10px] text-rose-700 block font-bold">Mes Vencido (+30%)</span>
                  <span className="font-bold text-rose-800 block text-xs">
                    {formatCurrency(Math.round(selectedCurso.arancelEfectivoBase * 1.3))}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    {formatCurrency(Math.round(selectedCurso.arancelTransferenciaBase * 1.3))} (Trf)
                  </span>
                </div>
              </div>
            </div>

            {/* Libros y Materiales Oficiales */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#00205B]" />
                Bibliografía Oficial y Materiales Exigidos
              </h4>
              <ul className="space-y-1 pl-1">
                {selectedCurso.librosMateriales.map((libro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{libro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comisiones y Cupos en Tiempo Real */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00205B]" />
                  Comisiones Disponibles y Ocupación ({selectedCurso.comisiones.length})
                </span>
              </h4>

              <div className="space-y-2">
                {selectedCurso.comisiones.map((com) => {
                  const pct = Math.round((com.cupoOcupado / com.cupoMaximo) * 100);
                  const disponibles = com.cupoMaximo - com.cupoOcupado;

                  return (
                    <div
                      key={com.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#00205B] text-xs mr-2">
                            {com.codigo}
                          </span>
                          <Badge variant="default" size="sm">
                            Turno {com.turno}
                          </Badge>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            disponibles > 2 ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {disponibles} vacantes libres
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400">Horario:</span> {com.diasHorarios}
                        </div>
                        <div>
                          <span className="text-slate-400">Docente:</span> {com.profesorTitular}
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Ocupación de cupo</span>
                          <span>
                            {com.cupoOcupado} / {com.cupoMaximo} alumnos ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 85 ? "bg-rose-500" : "bg-[#00205B]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar Ficha
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
