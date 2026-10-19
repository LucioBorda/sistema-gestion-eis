"use client";

import React, { useState, useMemo } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { CobranzaItem, MetodoCobro } from "../types";
import { EstudianteItem } from "@/features/estudiantes/types";
import { CalculadoraVuelto } from "./CalculadoraVuelto";
import { ReciboNoFiscalModal } from "./ReciboNoFiscalModal";
import { WhatsAppCobranzaModal } from "./WhatsAppCobranzaModal";
import { calcularTramoYTarifa } from "../tariffCalculator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Wallet,
  Banknote,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Receipt,
  User,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CobroRapidoDeskProps {
  onCobroRegistrado?: (cobranza: CobranzaItem) => void;
}

export const CobroRapidoDesk: React.FC<CobroRapidoDeskProps> = ({
  onCobroRegistrado,
}) => {
  const { cobranzas, estudiantes, cursos, registrarPago, addCobranza } = useGlobalData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteItem | null>(null);
  const [selectedCobranza, setSelectedCobranza] = useState<CobranzaItem | null>(null);

  // Payment Form State
  const [metodoPago, setMetodoPago] = useState<MetodoCobro>("Efectivo");
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [comprobanteRef, setComprobanteRef] = useState<string>("");
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [lastCobranzaEmitida, setLastCobranzaEmitida] = useState<CobranzaItem | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(18);

  React.useEffect(() => {
    setCurrentDay(new Date().getDate());
  }, []);

  // Filter students based on quick search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return estudiantes.filter(
      (e) =>
        e.nombreCompleto.toLowerCase().includes(q) ||
        e.dni.replace(/\./g, "").includes(q.replace(/\./g, "")) ||
        e.legajoNumero.toLowerCase().includes(q)
    );
  }, [searchQuery, estudiantes]);

  // Compute status for the selected student
  const studentAccountData = useMemo(() => {
    if (!selectedEstudiante) return null;

    const studentCobranzas = cobranzas.filter(
      (c) => c.estudianteId === selectedEstudiante.id
    );

    const vencidasAnteriores = studentCobranzas.filter((c) => c.estado === "Vencido");
    const pendientesMes = studentCobranzas.filter((c) => c.estado === "Pendiente");
    const pagadas = studentCobranzas.filter((c) => c.estado === "Pagado");

    let statusType: "AlDía" | "PendienteMes" | "MoraVencida" = "AlDía";
    let pendingToPay: CobranzaItem | null = null;

    if (vencidasAnteriores.length > 0) {
      statusType = "MoraVencida";
      pendingToPay = vencidasAnteriores[0];
    } else if (pendientesMes.length > 0) {
      statusType = "PendienteMes";
      pendingToPay = pendientesMes[0];
    }

    return {
      statusType,
      pendingToPay,
      vencidasCount: vencidasAnteriores.length,
      pendientesCount: pendientesMes.length,
      pagadasCount: pagadas.length,
      totalHistorico: studentCobranzas.length,
    };
  }, [selectedEstudiante, cobranzas]);

  // Handle student selection
  const handleSelectStudent = (est: EstudianteItem) => {
    setSelectedEstudiante(est);
    setSearchQuery("");
    setMontoRecibido(0);
    setComprobanteRef(`CAJA-${Date.now().toString().slice(-4)}`);

    // Find if student has any pending item
    const studentCob = cobranzas.find(
      (c) => c.estudianteId === est.id && c.estado !== "Pagado"
    );
    if (studentCob) {
      setSelectedCobranza(studentCob);
    } else {
      setSelectedCobranza(null);
    }
  };

  // Determine current fee based on today's date
  const calculoTarifa = useMemo(() => {
    if (!selectedEstudiante) return null;

    // find course base fee
    const matchingCurso = cursos?.find((c) =>
      selectedEstudiante.cursoActual.toUpperCase().includes(c.nombre.toUpperCase())
    );

    const baseEf = matchingCurso ? matchingCurso.arancelEfectivoBase : 54000;
    const baseTrf = matchingCurso ? matchingCurso.arancelTransferenciaBase : 59400;

    const esMora = studentAccountData?.statusType === "MoraVencida";
    return calcularTramoYTarifa(
      baseEf,
      baseTrf,
      metodoPago,
      esMora,
      new Date(2026, 9, currentDay)
    );
  }, [selectedEstudiante, metodoPago, studentAccountData, cursos, currentDay]);

  // Execution: Submit payment in cashier
  const handleConfirmarCobro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstudiante) return;

    if (metodoPago === "Transferencia" && !comprobanteRef.trim()) {
      alert("Por favor ingrese el número de comprobante o referencia bancaria.");
      return;
    }

    const totalCobrado = calculoTarifa ? calculoTarifa.montoFinal : 54000;
    const vuelto = metodoPago === "Efectivo" ? Math.max(0, montoRecibido - totalCobrado) : 0;

    if (metodoPago === "Efectivo" && montoRecibido > 0 && montoRecibido < totalCobrado) {
      alert("El monto recibido en efectivo es menor al arancel total a cobrar.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const cajeroStr = `${currentUser.name} (${currentUser.role})`;

    let itemFinal: CobranzaItem;

    if (selectedCobranza) {
      // Registrar sobre cobranza existente
      registrarPago(selectedCobranza.id, metodoPago, comprobanteRef, cajeroStr);
      itemFinal = {
        ...selectedCobranza,
        estado: "Pagado",
        fechaPago: todayStr,
        metodoPago,
        comprobanteReferencia: comprobanteRef,
        cajeroResponsable: cajeroStr,
        totalAPagar: totalCobrado,
        montoRecibido: metodoPago === "Efectivo" ? montoRecibido : totalCobrado,
        vueltoEntregado: vuelto,
      };
    } else {
      // Emitir cuota y cobrar en el acto
      const reciboNumero = `REC-2026-${String(cobranzas.length + 430).padStart(5, "0")}`;
      const newCob: CobranzaItem = {
        id: `cob-${Date.now()}`,
        reciboNumero,
        estudianteId: selectedEstudiante.id,
        estudianteNombre: selectedEstudiante.nombreCompleto,
        estudianteDni: selectedEstudiante.dni,
        legajoNumero: selectedEstudiante.legajoNumero,
        cursoNombre: selectedEstudiante.cursoActual,
        concepto: `Cuota Arancelaria ${formatDate(todayStr).slice(3)}`,
        mesPeriodo: "Octubre 2026",
        montoBaseEfectivo: calculoTarifa?.montoFinal || 54000,
        montoBaseTransferencia: Math.round((calculoTarifa?.montoFinal || 54000) * 1.1),
        montoBase: calculoTarifa ? calculoTarifa.montoFinal : 54000,
        tramoFecha: calculoTarifa ? calculoTarifa.tramo : "tramo_1_10",
        porcentajeRecargo: calculoTarifa ? calculoTarifa.porcentajeRecargo : 0,
        recargoMora: calculoTarifa && calculoTarifa.porcentajeRecargo > 0
          ? Math.round((calculoTarifa.montoFinal * calculoTarifa.porcentajeRecargo) / 100)
          : 0,
        totalAPagar: totalCobrado,
        fechaVencimiento: "2026-10-10",
        fechaPago: todayStr,
        metodoPago,
        cajeroResponsable: cajeroStr,
        estado: "Pagado",
        comprobanteReferencia: comprobanteRef || `CAJA-${Date.now().toString().slice(-4)}`,
        observaciones: `Cobro en mostrador Secretaría · ${calculoTarifa?.tramoNombre}`,
        montoRecibido: metodoPago === "Efectivo" ? montoRecibido : totalCobrado,
        vueltoEntregado: vuelto,
      };
      addCobranza(newCob);
      itemFinal = newCob;
    }

    setLastCobranzaEmitida(itemFinal);
    setReciboModalOpen(true);
    if (onCobroRegistrado) {
      onCobroRegistrado(itemFinal);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            Operatoria Diaria de Ventanilla
          </div>
          <h2 className="text-lg font-black text-[#00205B] tracking-tight">
            Ventanilla de Cobro Rápido en Secretaría
          </h2>
          <p className="text-xs text-slate-500">
            Buscador ágil por DNI/Apellido, detección automática de tramos de mora, calculadora de vuelto y recibo no fiscal
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Día de Facturación Actual
          </span>
          <span className="text-sm font-black text-slate-800">
            Día {currentDay} del mes
          </span>
          <span className="text-[11px] text-[#00205B] font-semibold block">
            {calculoTarifa?.tramoNombre.split("(")[0]}
          </span>
        </div>
      </div>

      {/* Buscador Universal */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
          <Search className="w-3.5 h-3.5 text-[#00205B]" />
          Buscar Alumno por DNI, Apellido o Número de Legajo:
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ingrese DNI (ej: 48.912.445) o apellido (ej: Fernández, Castro)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00205B] focus:bg-white transition-all shadow-2xs font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Dropdown de resultados */}
        {searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {searchResults.map((est) => (
              <button
                key={est.id}
                type="button"
                onClick={() => handleSelectStudent(est)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{est.nombreCompleto}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    DNI {est.dni} · {est.legajoNumero} · {est.cursoActual}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      est.saldoPendiente > 0
                        ? est.saldoPendiente > 30000
                          ? "danger"
                          : "warning"
                        : "success"
                    }
                    size="sm"
                  >
                    {est.saldoPendiente > 0
                      ? `Deuda: ${formatCurrency(est.saldoPendiente)}`
                      : "Al día"}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel del Alumno Seleccionado */}
      {selectedEstudiante && studentAccountData && calculoTarifa && (
        <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-5 animate-in fade-in duration-200">
          {/* Header del Alumno */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {selectedEstudiante.nombreCompleto}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  DNI {selectedEstudiante.dni} · {selectedEstudiante.legajoNumero} · {selectedEstudiante.cursoActual}
                </span>
              </div>
            </div>

            {/* Account Status Badge */}
            <div className="flex items-center gap-2">
              {studentAccountData.statusType === "AlDía" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Estado: Al Día (Sin deudas)</span>
                </div>
              )}
              {studentAccountData.statusType === "PendienteMes" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Estado: Cuota del Mes Pendiente</span>
                </div>
              )}
              {studentAccountData.statusType === "MoraVencida" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 font-extrabold text-xs border border-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Estado: Meses Anteriores Adeudados (+30% mora)</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors shadow-2xs"
                title="Contactar al alumno o tutor por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEstudiante(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                Cambiar
              </Button>
            </div>
          </div>

          {/* Formulario de Cobro en Mostrador */}
          <form onSubmit={handleConfirmarCobro} className="space-y-4">
            {/* Liquidación en Tiempo Real */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Concepto a Cobrar
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  {selectedCobranza ? selectedCobranza.concepto : `Cuota Mensual Actual (${selectedEstudiante.cursoActual})`}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Vigencia: Octubre 2026
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Tramo Aplicado según Fecha
                </span>
                <span className="text-xs font-bold text-[#00205B] block mt-1">
                  {calculoTarifa.tramoNombre}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Recargo aplicado: <strong>{calculoTarifa.porcentajeRecargo}%</strong>
                </span>
              </div>

              <div className="bg-[#00205B] text-white p-3.5 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  Total a Percibir Hoy
                </span>
                <span className="text-2xl font-black tracking-tight">
                  {formatCurrency(calculoTarifa.montoFinal)}
                </span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Seleccione Método de Pago:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodoPago("Efectivo")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    metodoPago === "Efectivo"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Efectivo en Ventanilla</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("Transferencia")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    metodoPago === "Transferencia"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Transferencia Bancaria</span>
                </button>
              </div>

              {/* Sub-panels depending on method */}
              {metodoPago === "Efectivo" ? (
                <CalculadoraVuelto
                  totalACobrar={calculoTarifa.montoFinal}
                  montoRecibido={montoRecibido}
                  onMontoRecibidoChange={setMontoRecibido}
                />
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <label className="block text-xs font-bold text-blue-900">
                    Número de Comprobante / Código de Operación Bancaria (Obligatorio):
                  </label>
                  <input
                    type="text"
                    value={comprobanteRef}
                    onChange={(e) => setComprobanteRef(e.target.value)}
                    placeholder="ej: TRF-BAPRO-994120 o MP-8912384"
                    required
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-blue-700 block">
                    Banco Provincia · CBU: 0140999801200018294812 · Titular: Cultural Inglesa de Ensenada
                  </span>
                </div>
              )}
            </div>

            {/* Botón de Confirmación y Emisión */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Al confirmar, se emitirá automáticamente el <strong>Recibo No Fiscal</strong> correlativo.
              </span>
              <Button
                type="submit"
                variant="coral"
                size="md"
                className="font-bold shadow-md shadow-[#E63956]/20"
                icon={<Receipt className="w-4 h-4" />}
              >
                Cobrar {formatCurrency(calculoTarifa.montoFinal)} y Emitir Recibo
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Recibo No Fiscal Modal */}
      <ReciboNoFiscalModal
        isOpen={reciboModalOpen}
        onClose={() => setReciboModalOpen(false)}
        cobranza={lastCobranzaEmitida}
        onNotifyWhatsApp={(cob) => {
          setLastCobranzaEmitida(cob);
          setWhatsAppModalOpen(true);
        }}
      />

      {/* Modal Comunicación Oficial por WhatsApp */}
      <WhatsAppCobranzaModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        cobranza={lastCobranzaEmitida || studentAccountData?.pendingToPay || null}
        estudiante={selectedEstudiante}
      />
    </div>
  );
};
