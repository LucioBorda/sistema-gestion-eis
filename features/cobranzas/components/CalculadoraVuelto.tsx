"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Banknote, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface CalculadoraVueltoProps {
  totalACobrar: number;
  montoRecibido: number;
  onMontoRecibidoChange: (monto: number) => void;
}

export const CalculadoraVuelto: React.FC<CalculadoraVueltoProps> = ({
  totalACobrar,
  montoRecibido,
  onMontoRecibidoChange,
}) => {
  const vuelto = montoRecibido - totalACobrar;
  const esMenorQueCobro = montoRecibido > 0 && montoRecibido < totalACobrar;
  const esCero = !montoRecibido || montoRecibido <= 0;
  const esExacto = montoRecibido === totalACobrar && totalACobrar > 0;
  const hayVuelto = vuelto > 0;
  const faltante = totalACobrar - (montoRecibido || 0);

  const billetesComunes = [10000, 20000, 50000, 100000];

  const handleSumarBillete = (valor: number) => {
    onMontoRecibidoChange((montoRecibido || 0) + valor);
  };

  const handlePagoExacto = () => {
    onMontoRecibidoChange(totalACobrar);
  };

  // Genera un redondeo útil al billete superior más cercano
  const redondearSuperior = () => {
    if (totalACobrar <= 0) return;
    const proximoDiezMil = Math.ceil(totalACobrar / 10000) * 10000;
    onMontoRecibidoChange(proximoDiezMil > totalACobrar ? proximoDiezMil : totalACobrar + 10000);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-600" />
          Calculadora de Vuelto y Validación de Cobro
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Cobro concurrente:{" "}
          <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
            {formatCurrency(totalACobrar)}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Dinero Recibido en Mostrador (ARS):</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Mínimo: {formatCurrency(totalACobrar)}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
            <input
              type="number"
              min={totalACobrar}
              value={montoRecibido || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                onMontoRecibidoChange(val);
              }}
              placeholder={`Mínimo ${totalACobrar}`}
              className={`w-full pl-7 pr-3 py-2 text-sm font-bold rounded-xl transition-all outline-none font-mono ${
                esMenorQueCobro
                  ? "bg-rose-50 border-2 border-rose-400 text-rose-950 focus:ring-2 focus:ring-rose-500"
                  : esExacto || hayVuelto
                  ? "bg-white border-2 border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  : "bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>

          {/* Mensajes de validación en tiempo real */}
          {esMenorQueCobro && (
            <p className="text-[11px] text-rose-700 font-bold mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>
                No puede ser menor a {formatCurrency(totalACobrar)}. Faltan {formatCurrency(faltante)}.
              </span>
            </p>
          )}

          {esCero && (
            <p className="text-[10px] text-slate-500 mt-1">
              * Ingrese el dinero entregado por el estudiante o tutor.
            </p>
          )}

          {esExacto && (
            <p className="text-[11px] text-blue-700 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Importe justo y exacto. Sin vuelto a entregar.</span>
            </p>
          )}

          {hayVuelto && (
            <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monto cubierto. Entregar vuelto de {formatCurrency(vuelto)}.</span>
            </p>
          )}
        </div>

        {/* Display visual del Vuelto / Estado de Cobro */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center transition-all ${
            esMenorQueCobro
              ? "bg-rose-100/70 border-rose-300 text-rose-900"
              : esExacto
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : hayVuelto
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {esMenorQueCobro
              ? "Monto Menor al Concurrente"
              : esExacto
              ? "Pago Justo / Exacto"
              : hayVuelto
              ? "Vuelto a Entregar en Mostrador"
              : "Ingrese Monto Recibido"}
          </span>

          <span className="text-lg font-black tracking-tight mt-0.5">
            {esMenorQueCobro ? (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-800">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                Faltan {formatCurrency(faltante)} para cobrar
              </span>
            ) : esExacto ? (
              <span className="flex items-center gap-1 text-sm font-bold text-blue-800">
                <CheckCircle2 className="w-4 h-4" />
                Sin vuelto ($ 0,00)
              </span>
            ) : hayVuelto ? (
              formatCurrency(vuelto)
            ) : (
              `Mínimo ${formatCurrency(totalACobrar)}`
            )}
          </span>

          {esMenorQueCobro && (
            <button
              type="button"
              onClick={handlePagoExacto}
              className="mt-1.5 text-[10px] font-bold text-rose-900 underline hover:text-rose-950"
            >
              Completar a {formatCurrency(totalACobrar)}
            </button>
          )}
        </div>
      </div>

      {/* Botones de atajos y billetes rápidos */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Atajos de Ventanilla:
          </span>
          <button
            type="button"
            onClick={handlePagoExacto}
            className="text-[11px] font-bold text-[#00205B] hover:underline flex items-center gap-1"
          >
            <span>Fijar pago exacto ({formatCurrency(totalACobrar)})</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handlePagoExacto}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
          >
            Monto Exacto
          </button>
          <button
            type="button"
            onClick={redondearSuperior}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            Redondear Superior
          </button>
          {billetesComunes.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleSumarBillete(b)}
              className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-600 hover:text-emerald-800 transition-colors shadow-2xs"
            >
              +${(b / 1000).toLocaleString()}k
            </button>
          ))}
          <button
            type="button"
            onClick={() => onMontoRecibidoChange(0)}
            className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-lg text-xs font-semibold ml-auto"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};
