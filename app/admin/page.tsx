"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  TrendingUp,
  School,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Award,
  Banknote,
  CreditCard,
  FileSpreadsheet,
  CalendarDays,
} from "lucide-react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CalendarioInstitucional } from "@/features/calendario/components/CalendarioInstitucional";

export default function AdminDashboardPage(): React.ReactElement {
  const { currentUser } = useAuth();
  const {
    estudiantes,
    cobranzas,
    comisiones,
    calificaciones,
  } = useGlobalData();

  // Metrics calculations
  const totalAlumnosActivos = estudiantes.filter((e) => e.estado === "Regular").length;
  const comisionesActivas = comisiones.filter((c) => c.activo).length;

  const pagosRealizados = cobranzas.filter((c) => c.estado === "Pagado");
  const totalRecaudadoMes = pagosRealizados.reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const totalEfectivo = pagosRealizados
    .filter((c) => c.metodoPago === "Efectivo")
    .reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const totalTransferencia = pagosRealizados
    .filter((c) => c.metodoPago === "Transferencia")
    .reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const pagosVencidos = cobranzas.filter((c) => c.estado === "Vencido");
  const porcentajeMorosidad = cobranzas.length > 0
    ? Math.round((pagosVencidos.length / cobranzas.length) * 100)
    : 0;

  const totalCupos = comisiones.reduce((acc, curr) => acc + curr.cupoMaximo, 0);
  const totalOcupados = comisiones.reduce((acc, curr) => acc + curr.cupoOcupado, 0);
  const ocupacionPorcentaje = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 100) : 0;

  // Docente specific metrics
  const totalNotasCargadas = calificaciones.length;
  const calificacionesConNota = calificaciones.filter((c) => c.promedioFinal !== null);
  const promedioAcademico =
    calificacionesConNota.length > 0
      ? (
          calificacionesConNota.reduce((acc, curr) => acc + (curr.promedioFinal || 0), 0) /
          calificacionesConNota.length
        ).toFixed(1)
      : "8.8";

  return (
    <div className="space-y-4">
      {/* Welcome Banner (Clean, compact and without extra texts) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00205B] via-[#0C3B8C] to-[#00153D] px-6 py-4 sm:py-5 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            ¡Bienvenida/o, {currentUser.name}!
          </h1>
          <p className="mt-1 text-xs text-slate-200 leading-relaxed">
            Gestión académica y administrativa centralizada para <strong>EIS Institute (Cultural Inglesa de Ensenada)</strong>.
          </p>
        </div>

        {/* Decorative background crest */}
        <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none select-none text-[120px] font-black text-white">
          EIS
        </div>
      </div>

      {/* Real-time Metric Cards Grid (Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Alumnos Activos */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Alumnos Regulares
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#00205B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#00205B]">
              {totalAlumnosActivos}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs. Ciclo 2025</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Role-tailored (Directora / Administrador: Recaudación $ / Secretaria: Pagos procesados / Docente: Actas) */}
        {(currentUser.role === "Directora" || currentUser.role === "Administrador") && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recaudación Mes
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-[#00205B]">
                {formatCurrency(totalRecaudadoMes)}
              </div>
              <div className="mt-0.5 text-[10.5px] text-slate-500 flex items-center justify-between">
                <span>Efvo: {formatCurrency(totalEfectivo)}</span>
                <span>Trf: {formatCurrency(totalTransferencia)}</span>
              </div>
            </div>
          </div>
        )}

        {currentUser.role === "Secretaria" && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cuotas Cobradas Mes
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-[#00205B]">
                {pagosRealizados.length} pagos
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-600 font-semibold">
                Asentados en ventanilla y BAPRO
              </div>
            </div>
          </div>
        )}

        {currentUser.role === "Docente" && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actas & Evaluaciones
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-[#00205B]">
                {totalNotasCargadas} actas
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-600 font-semibold">
                Parciales y finales asentados
              </div>
            </div>
          </div>
        )}

        {/* Metric 3: Comisiones & Ocupación */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Comisiones Activas
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#00205B]">
              {comisionesActivas} comisiones
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#00205B] h-1.5 rounded-full"
                  style={{ width: `${ocupacionPorcentaje}%` }}
                />
              </div>
              <span className="font-semibold text-slate-700">{ocupacionPorcentaje}%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Role-tailored (Directora / Administrador: Morosidad % / Secretaria: Cuotas Pendientes / Docente: Promedio) */}
        {(currentUser.role === "Directora" || currentUser.role === "Administrador") && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Morosidad Actual
              </span>
              <div className="p-2 rounded-lg bg-rose-50 text-[#E63956]">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-[#E63956]">
                {porcentajeMorosidad}%
              </div>
              <div className="mt-0.5 text-[11px] text-rose-600 font-semibold">
                {pagosVencidos.length} cuotas pendientes
              </div>
            </div>
          </div>
        )}

        {currentUser.role === "Secretaria" && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cuotas Pendientes
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-amber-700">
                {pagosVencidos.length} cuotas
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 font-medium">
                En seguimiento administrativo
              </div>
            </div>
          </div>
        )}

        {currentUser.role === "Docente" && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Promedio General
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-[#00205B]">
                {promedioAcademico} / 10
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Rendimiento de estudiantes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CALENDARIO INSTITUCIONAL INTEGRAL (ESTILO GOOGLE CALENDAR) */}
      <CalendarioInstitucional />

      {/* FINANCIAL AUDIT (Visible for Directora and Administrador) */}
      {(currentUser.role === "Directora" || currentUser.role === "Administrador") && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#00205B]">
                Auditoría de Cobros Recientes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión directiva de ingresos y comprobantes emitidos en caja
              </p>
            </div>
            <Link href="/admin/cobranzas">
              <Button variant="ghost" size="sm" className="text-xs text-[#00205B]">
                Ir a Cobranzas y Aranceles →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Recibo / Fecha</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cobranzas.slice(0, 5).map((cob) => (
                  <tr key={cob.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cob.reciboNumero}</div>
                      <div className="text-[10px] text-slate-400">
                        {cob.fechaPago ? formatDate(cob.fechaPago) : `Vence ${formatDate(cob.fechaVencimiento)}`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {cob.estudianteNombre}
                      </div>
                      <div className="text-[10px] text-slate-400">DNI {cob.estudianteDni}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cob.concepto}</td>
                    <td className="py-3 px-4">
                      {cob.metodoPago ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          {cob.metodoPago === "Efectivo" ? (
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {cob.metodoPago}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(cob.totalAPagar)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          cob.estado === "Pagado"
                            ? "success"
                            : cob.estado === "Pendiente"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {cob.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCENTE GRADES AUDIT (Visible for Docente) */}
      {currentUser.role === "Docente" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#00205B]">
                Últimas Calificaciones Registradas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento pedagógico de rendimiento por comisión
              </p>
            </div>
            <Link href="/admin/calificaciones">
              <Button variant="ghost" size="sm" className="text-xs text-[#00205B]">
                Ver todas las actas →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Materia / Comisión</th>
                  <th className="py-3 px-4 text-center">1º Parcial</th>
                  <th className="py-3 px-4 text-center">2º Parcial</th>
                  <th className="py-3 px-4 text-center">Final</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calificaciones.slice(0, 5).map((cal) => (
                  <tr key={cal.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cal.estudianteNombre}</div>
                      <div className="text-[10px] text-slate-400">DNI {cal.dni}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{cal.materiaNombre}</div>
                      <div className="text-[10px] text-slate-500">{cal.comisionNombre}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cal.primerParcial ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cal.segundoParcial ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#00205B]">
                      {cal.promedioFinal ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          cal.estadoAprobacion === "Aprobado"
                            ? "success"
                            : cal.estadoAprobacion === "En Curso"
                            ? "info"
                            : "warning"
                        }
                        size="sm"
                      >
                        {cal.estadoAprobacion}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
