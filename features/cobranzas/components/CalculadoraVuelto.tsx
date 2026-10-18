"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Banknote, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const esInsuficiente = montoRecibido > 0 && vuelto < 0;
  const esExacto = montoRecibido === totalACobrar && totalACobrar > 0;
  const hayVuelto = vuelto > 0;

  const billetesComunes = [10000, 20000, 50000, 100000];

  const handleSumarBillete = (valor: number) => {
    onMontoRecibidoChange(montoRecibido + valor);
  };

  const handlePagoExacto = () => {
    onMontoRecibidoChange(totalACobrar);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-600" />
          Calculadora Rápida de Vuelto (Efectivo)
        </span>
        <span className="text-xs text-slate-500 font-medium">
          A cobrar: <strong className="text-slate-900">{formatCurrency(totalACobrar)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Dinero Recibido del Alumno / Tutor (ARS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
            <input
              type="number"
              value={montoRecibido || ""}
              onChange={(e) => onMontoRecibidoChange(Number(e.target.value))}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Display visual del Vuelto */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center transition-all ${
            esInsuficiente
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : esExacto
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : hayVuelto
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {esInsuficiente
              ? "Monto Insuficiente"
              : esExacto
              ? "Pago Justo / Exacto"
              : hayVuelto
              ? "Vuelto a Entregar en Mostrador"
              : "Ingrese Monto Recibido"}
          </span>
          <span className="text-lg font-black tracking-tight mt-0.5">
            {esInsuficiente ? (
              <span className="flex items-center gap-1 text-sm font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                Faltan {formatCurrency(Math.abs(vuelto))}
              </span>
            ) : esExacto ? (
              <span className="flex items-center gap-1 text-sm font-bold text-blue-800">
                <CheckCircle2 className="w-4 h-4" />
                Sin vuelto ($ 0,00)
              </span>
            ) : hayVuelto ? (
              formatCurrency(vuelto)
            ) : (
              "$ 0,00"
            )}
          </span>
        </div>
      </div>

      {/* Botones de billetes rápidos */}
      <div>
        <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
          Billetes rápidos o redondos:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handlePagoExacto}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            Monto Exacto
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
