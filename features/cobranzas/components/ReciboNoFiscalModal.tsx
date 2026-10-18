"use client";

import React, { useRef } from "react";
import { CobranzaItem } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Printer, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReciboNoFiscalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cobranza: CobranzaItem | null;
}

export const ReciboNoFiscalModal: React.FC<ReciboNoFiscalModalProps> = ({
  isOpen,
  onClose,
  cobranza,
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!cobranza) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recibo Oficial de Cobranza (No Fiscal)"
      subtitle="Comprobante reglamentario de ventanilla para el alumno y archivo institucional"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable Card Area */}
        <div
          ref={printRef}
          id="recibo-imprimible"
          className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-xs text-slate-900 space-y-4 font-sans print:border-none print:p-0"
        >
          {/* Header Membrete */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-[#00205B]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00205B] text-white flex items-center justify-center font-black text-xs border border-[#E63956]">
                  EIS
                </div>
                <div>
                  <h3 className="font-extrabold text-[#00205B] text-sm tracking-tight leading-none">
                    EIS INSTITUTE
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Cultural Inglesa de Ensenada
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                Sede Central: Calle La Paz Nº 525 · Ensenada (B1925)<br />
                Tel: (0221) 469-5201 · Centro Oficial Anglia AR-ENS-084
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Nº Recibo Correlativo
              </span>
              <span className="text-base font-black text-[#00205B] font-mono block">
                {cobranza.reciboNumero}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                Fecha: {cobranza.fechaPago ? formatDate(cobranza.fechaPago) : formatDate(cobranza.fechaVencimiento)}
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ORIGINAL · CLIENTE
              </span>
            </div>
          </div>

          {/* Student & Course Data */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Estudiante / Titular:
              </span>
              <span className="font-bold text-slate-900 text-xs block">
                {cobranza.estudianteNombre}
              </span>
              <span className="text-[11px] text-slate-600 font-mono">
                DNI {cobranza.estudianteDni} · {cobranza.legajoNumero}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Programa / Nivel Cursado:
              </span>
              <span className="font-bold text-[#00205B] text-xs block">
                {cobranza.cursoNombre}
              </span>
              <span className="text-[11px] text-slate-600 block">
                Período: {cobranza.mesPeriodo}
              </span>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold text-left">
                <th className="py-2">Concepto Arancelario</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 text-slate-800">
                  <span className="font-semibold block">{cobranza.concepto}</span>
                  <span className="text-[10px] text-slate-500">
                    Arancel regular correspondiente a {cobranza.mesPeriodo}
                  </span>
                </td>
                <td className="py-2 text-right font-medium text-slate-800">
                  {formatCurrency(cobranza.montoBase)}
                </td>
              </tr>
              {cobranza.recargoMora > 0 && (
                <tr className="text-rose-700 bg-rose-50/40">
                  <td className="py-1.5 font-semibold text-[11px]">
                    Recargo por vencimiento / mora ({cobranza.porcentajeRecargo}%)
                  </td>
                  <td className="py-1.5 text-right font-bold">
                    + {formatCurrency(cobranza.recargoMora)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total percibido */}
          <div className="p-3 bg-[#00205B] text-white rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Percibido:
            </span>
            <span className="text-xl font-black tracking-tight">
              {formatCurrency(cobranza.totalAPagar)}
            </span>
          </div>

          {/* Payment Method Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Medio de Pago:</span>
              <span className="font-bold text-slate-800">
                {cobranza.metodoPago || "Efectivo en Ventanilla"}
              </span>
            </div>
            {cobranza.metodoPago === "Efectivo" && cobranza.montoRecibido ? (
              <>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Dinero Recibido:</span>
                  <span>{formatCurrency(cobranza.montoRecibido)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                  <span>Vuelto Entregado:</span>
                  <span>{formatCurrency(cobranza.vueltoEntregado || 0)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Nº Comprobante / Ref:</span>
                <span className="font-mono font-semibold">
                  {cobranza.comprobanteReferencia || "CAJA-VENTANILLA"}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              <span>Operador Responsable:</span>
              <span>{cobranza.cajeroResponsable || "Secretaría EIS"}</span>
            </div>
          </div>

          {/* LEYENDA REGLAMENTARIA OBLIGATORIA */}
          <div className="border-t border-dashed border-slate-300 pt-3 text-center space-y-1">
            <p className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
              *** Comprobante interno no válido como factura ***
            </p>
            <p className="text-[9px] text-slate-400">
              Cultural Inglesa de Ensenada (EIS Institute) · La Paz Nº 525 · Ensenada · Buenos Aires
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Imprimir Recibo (Ctrl + P)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
