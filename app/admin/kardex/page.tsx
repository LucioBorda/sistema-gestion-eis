"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { KardexItem } from "@/features/kardex/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Printer,
  Search,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import { formatDate } from "@/lib/utils";

export default function KardexPage(): React.ReactElement {
  const { kardexList, estudiantes } = useGlobalData();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    kardexList[0]?.estudianteId || "est-1"
  );
  const [searchStudent, setSearchStudent] = useState("");

  const currentKardex =
    kardexList.find((k) => k.estudianteId === selectedStudentId) || kardexList[0];

  const filteredKardexList = kardexList.filter(
    (k) =>
      k.estudianteNombre.toLowerCase().includes(searchStudent.toLowerCase()) ||
      k.dni.includes(searchStudent) ||
      k.legajoNumero.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handlePrintKardexOfficial = () => {
    if (!currentKardex) return;

    const htmlBody = `
      <div style="font-size: 13px; line-height: 1.6;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #00205B;">LEGAJO ESTUDIANTIL HISTÓRICO 360°</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Estudiante:</strong> ${currentKardex.estudianteNombre}</div>
            <div><strong>Documento Nacional de Identidad:</strong> ${currentKardex.dni}</div>
            <div><strong>Nº de Legajo Institucional:</strong> ${currentKardex.legajoNumero}</div>
            <div><strong>Fecha de Ingreso:</strong> ${formatDate(currentKardex.fechaIngresoInstitucional)}</div>
            <div><strong>Promedio Histórico Acumulado:</strong> <span style="color: #00205B; font-weight: bold;">${currentKardex.promedioHistorico.toFixed(2)}</span></div>
            <div><strong>Asistencia Global Registrada:</strong> ${currentKardex.porcentajeAsistenciaGlobal}%</div>
          </div>
        </div>

        <h4 style="color: #00205B; border-bottom: 1px solid #00205B; padding-bottom: 4px; margin-top: 24px;">
          1. TRAYECTORIA ACADÉMICA Y CURSOS APROBADOS
        </h4>
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Curso / Nivel</th>
              <th>Comisión</th>
              <th>Docente a Cargo</th>
              <th>Nota Final</th>
              <th>Asistencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${currentKardex.historialCursos
              .map(
                (c) => `
              <tr>
                <td><strong>${c.anio}</strong></td>
                <td>${c.curso}</td>
                <td>${c.comision}</td>
                <td>${c.docenteACargo}</td>
                <td><strong>${c.calificacionFinal}</strong></td>
                <td>${c.asistenciaPorcentaje}%</td>
                <td>${c.estado}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h4 style="color: #00205B; border-bottom: 1px solid #00205B; padding-bottom: 4px; margin-top: 28px;">
          2. CERTIFICACIONES INTERNACIONALES (ANGLIA / UTN)
        </h4>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Título del Examen</th>
              <th>MCER</th>
              <th>Año</th>
              <th>Calificación Oficial</th>
              <th>Folio / Acta Nº</th>
            </tr>
          </thead>
          <tbody>
            ${currentKardex.certificaciones
              .map(
                (cert) => `
              <tr>
                <td><strong>${cert.tipo}</strong></td>
                <td>${cert.tituloExamen}</td>
                <td>${cert.nivelMCER}</td>
                <td>${cert.anio}</td>
                <td>${cert.calificacionOtenida}</td>
                <td><code>${cert.folioNumero}</code></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h4 style="color: #00205B; border-bottom: 1px solid #00205B; padding-bottom: 4px; margin-top: 28px;">
          3. REGISTRO DE OBSERVACIONES Y EVOLUCIÓN PEDAGÓGICA
        </h4>
        <ul style="padding-left: 20px; color: #334155;">
          ${currentKardex.observacionesPedagogicas
            .map((obs) => `<li style="margin-bottom: 6px;">${obs}</li>`)
            .join("")}
        </ul>

        <div class="signatures">
          <div>
            <div class="sig-line">Secretaría Académica</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">EIS Institute</div>
          </div>
          <div>
            <div class="sig-line">Lic. Patricia Valenzuela</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Directora General · Chichester College Centre</div>
          </div>
        </div>
      </div>
    `;
    openInstitutionalPrintPreview(
      `Kardex_Historico_${currentKardex.legajoNumero}`,
      htmlBody
    );
  };

  const handleExportCSV = () => {
    if (!currentKardex) return;
    exportToExcelCSV(
      `kardex_${currentKardex.legajoNumero}`,
      [
        { header: "Año", accessor: "anio" },
        { header: "Curso", accessor: "curso" },
        { header: "Comisión", accessor: "comision" },
        { header: "Docente", accessor: "docenteACargo" },
        { header: "Calificación Final", accessor: "calificacionFinal" },
        { header: "Asistencia %", accessor: "asistenciaPorcentaje" },
        { header: "Estado", accessor: "estado" },
      ],
      currentKardex.historialCursos
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#00205B] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E63956]" />
            Kardex Estudiantil Histórico 360°
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ficha unificada de trayectoria pedagógica, certificaciones Anglia/UTN, asistencias y evolución
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Exportar Trayectoria
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={handlePrintKardexOfficial}
            icon={<Printer className="w-4 h-4" />}
          >
            Imprimir Kardex Oficial (PDF)
          </Button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Student Selector List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[700px]">
          <div className="mb-3">
            <span className="text-xs font-bold text-[#00205B] block mb-2">
              Seleccionar Estudiante ({kardexList.length})
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredKardexList.map((k) => {
              const isSelected = k.estudianteId === currentKardex?.estudianteId;
              return (
                <div
                  key={k.id}
                  onClick={() => setSelectedStudentId(k.estudianteId)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#00205B] bg-blue-50/70 ring-2 ring-[#00205B]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      {k.estudianteNombre}
                    </span>
                    <span className="text-[10px] font-bold text-[#00205B] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                      Prom: {k.promedioHistorico.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{k.legajoNumero}</span>
                    <span>DNI {k.dni}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): 360° Comprehensive Kardex View */}
        <div className="lg:col-span-8 space-y-6">
          {currentKardex ? (
            <>
              {/* Student Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00205B] to-[#0C3B8C] text-white flex items-center justify-center font-black text-xl shadow-md">
                      {currentKardex.estudianteNombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#00205B]">
                        {currentKardex.estudianteNombre}
                      </h2>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Legajo: {currentKardex.legajoNumero}</span>
                        <span>·</span>
                        <span>DNI: {currentKardex.dni}</span>
                        <span>·</span>
                        <span>Ingreso: {formatDate(currentKardex.fechaIngresoInstitucional)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        Promedio General
                      </div>
                      <div className="text-2xl font-black text-[#00205B]">
                        {currentKardex.promedioHistorico.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        Asistencia
                      </div>
                      <div className="text-2xl font-black text-emerald-600">
                        {currentKardex.porcentajeAsistenciaGlobal}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* International Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Certificaciones Oficiales:</span>
                  {currentKardex.certificaciones.map((cert) => (
                    <span
                      key={cert.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#00205B] border border-blue-200"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{cert.tituloExamen} ({cert.nivelMCER})</span>
                      <span className="text-[10px] font-bold text-[#E63956]">
                        {cert.calificacionOtenida}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#E63956]" />
                    Trayectoria Académica en EIS Institute
                  </h3>
                  <span className="text-xs text-slate-400">
                    {currentKardex.historialCursos.length} períodos registrados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                        <th className="py-3 px-4">Año</th>
                        <th className="py-3 px-4">Curso / Comisión</th>
                        <th className="py-3 px-4">Docente Titular</th>
                        <th className="py-3 px-4 text-center">Nota Final</th>
                        <th className="py-3 px-4 text-center">Asistencia</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentKardex.historialCursos.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{c.anio}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{c.curso}</span>
                            <span className="text-[10px] text-slate-400">{c.comision}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{c.docenteACargo}</td>
                          <td className="py-3 px-4 text-center font-bold text-[#00205B]">
                            {c.calificacionFinal}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-emerald-600">
                              {c.asistenciaPorcentaje}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                c.estado === "Aprobado" || c.estado === "Promocionado"
                                  ? "success"
                                  : c.estado === "En Curso"
                                  ? "navy"
                                  : "danger"
                              }
                              size="sm"
                            >
                              {c.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observaciones Pedagógicas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-sm font-bold text-[#00205B] mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#E63956]" />
                  Anotaciones Pedagógicas y Seguimiento Docente
                </h3>
                <div className="space-y-2">
                  {currentKardex.observacionesPedagogicas.map((obs, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-[#E63956] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
              Seleccione un estudiante de la lista para ver su legajo histórico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
