"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { CobranzaItem, MetodoCobro, EstadoPago } from "@/features/cobranzas/types";
import { CobroRapidoDesk } from "@/features/cobranzas/components/CobroRapidoDesk";
import { ReciboNoFiscalModal } from "@/features/cobranzas/components/ReciboNoFiscalModal";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  Banknote,
  CreditCard,
  FileCheck2,
  Printer,
  Receipt,
  Sparkles,
  Wallet,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function CobranzasPage(): React.ReactElement {
  const { cobranzas, estudiantes, addCobranza, registrarPago, deleteCobranza } =
    useGlobalData();
  const { currentUser } = useAuth();

  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedCob, setSelectedCob] = useState<CobranzaItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");

  // Form State: Nueva Cuota Manual
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [concepto, setConcepto] = useState("Cuota Arancelaria Noviembre 2026");
  const [mesPeriodo, setMesPeriodo] = useState("Noviembre 2026");
  const [monto, setMonto] = useState(54000);
  const [recargoMora, setRecargoMora] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState("2026-11-10");

  // KPI Calculations
  const totalEfectivo = cobranzas
    .filter((c) => c.estado === "Pagado" && c.metodoPago === "Efectivo")
    .reduce((acc, c) => acc + c.totalAPagar, 0);

  const totalTransferencia = cobranzas
    .filter((c) => c.estado === "Pagado" && c.metodoPago === "Transferencia")
    .reduce((acc, c) => acc + c.totalAPagar, 0);

  const vencidasCount = cobranzas.filter((c) => c.estado === "Vencido").length;
  const pagadasCount = cobranzas.filter((c) => c.estado === "Pagado").length;

  const handleOpenNew = () => {
    setSelectedCob(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setConcepto("Cuota Arancelaria Noviembre 2026");
    setMesPeriodo("Noviembre 2026");
    setMonto(54000);
    setRecargoMora(0);
    setFechaVencimiento("2026-11-10");
    setModalNewOpen(true);
  };

  const handleOpenReceipt = (item: CobranzaItem) => {
    setSelectedCob(item);
    setReciboModalOpen(true);
  };

  const handleOpenDetail = (item: CobranzaItem) => {
    setSelectedCob(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: CobranzaItem) => {
    setSelectedCob(item);
    setConfirmDeleteOpen(true);
  };

  const handleSaveNewArancel = (e: React.FormEvent) => {
    e.preventDefault();
    const estObj = estudiantes.find((e) => e.id === estudianteId);
    const estudianteNombre = estObj ? estObj.nombreCompleto : "Alumno";
    const estudianteDni = estObj ? estObj.dni : "00000000";
    const legajoNumero = estObj ? estObj.legajoNumero : "LEG-000";
    const cursoNombre = estObj ? estObj.cursoActual : "General";

    const reciboNumero = `REC-2026-${String(cobranzas.length + 420).padStart(5, "0")}`;
    const totalAPagar = monto + recargoMora;

    const newCob: CobranzaItem = {
      id: `cob-${Date.now()}`,
      reciboNumero,
      estudianteId,
      estudianteNombre,
      estudianteDni,
      legajoNumero,
      cursoNombre,
      concepto,
      mesPeriodo,
      montoBaseEfectivo: monto,
      montoBaseTransferencia: Math.round(monto * 1.1),
      montoBase: monto,
      tramoFecha: "tramo_1_10",
      porcentajeRecargo: 0,
      recargoMora,
      totalAPagar,
      fechaVencimiento,
      fechaPago: null,
      metodoPago: null,
      cajeroResponsable: null,
      estado: "Pendiente",
      comprobanteReferencia: null,
      observaciones: "Arancel mensual emitido por administración central.",
    };

    addCobranza(newCob);
    setModalNewOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCob) {
      deleteCobranza(selectedCob.id);
    }
    setConfirmDeleteOpen(false);
  };

  const filteredCobranzas =
    filterStatus === "TODOS"
      ? cobranzas
      : cobranzas.filter((c) => c.estado === filterStatus);

  const handleExportExcel = () => {
    exportToExcelCSV(
      "libro_caja_aranceles_eis_institute",
      [
        { header: "Recibo Nº", accessor: "reciboNumero" },
        { header: "Estudiante", accessor: "estudianteNombre" },
        { header: "DNI", accessor: "estudianteDni" },
        { header: "Programa", accessor: "cursoNombre" },
        { header: "Concepto", accessor: "concepto" },
        { header: "Monto Base", accessor: (c) => formatCurrency(c.montoBase) },
        { header: "Recargo Mora", accessor: (c) => formatCurrency(c.recargoMora) },
        { header: "Total", accessor: (c) => formatCurrency(c.totalAPagar) },
        { header: "Fecha Pago", accessor: (c) => (c.fechaPago ? formatDate(c.fechaPago) : "-") },
        { header: "Método", accessor: (c) => c.metodoPago || "-" },
        { header: "Estado", accessor: "estado" },
      ],
      filteredCobranzas
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Libro Diario de Caja y Aranceles - Cultural Inglesa de Ensenada (EIS Institute):</p>
      <table>
        <thead>
          <tr>
            <th>Recibo Nº</th>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Vencimiento</th>
            <th>Total</th>
            <th>Medio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${filteredCobranzas
            .map(
              (c) => `
            <tr>
              <td><strong>${c.reciboNumero}</strong></td>
              <td>${c.estudianteNombre}</td>
              <td>${c.cursoNombre}</td>
              <td>${formatDate(c.fechaVencimiento)}</td>
              <td>${formatCurrency(c.totalAPagar)}</td>
              <td>${c.metodoPago || "-"}</td>
              <td>${c.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Libro Diario de Caja EIS", htmlBody);
  };

  const columns: ColumnDef<CobranzaItem>[] = [
    {
      id: "recibo",
      header: "Nº Recibo",
      accessorKey: "reciboNumero",
      sortable: true,
      className: "w-32 font-bold text-[#00205B]",
    },
    {
      id: "estudiante",
      header: "Estudiante / Programa",
      accessorKey: "estudianteNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.estudianteNombre}</span>
          <span className="text-[11px] font-mono text-slate-500">
            DNI {item.estudianteDni} · {item.cursoNombre}
          </span>
        </div>
      ),
    },
    {
      id: "concepto",
      header: "Concepto / Período",
      accessorKey: "concepto",
      cell: (item) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{item.concepto}</span>
          <span className="text-[11px] text-slate-400">
            Vence: {formatDate(item.fechaVencimiento)}
          </span>
        </div>
      ),
    },
    {
      id: "monto",
      header: "Total a Pagar",
      accessorKey: "totalAPagar",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {formatCurrency(item.totalAPagar)}
          </span>
          {item.recargoMora > 0 && (
            <span className="text-[10px] text-rose-600 font-semibold block">
              + {formatCurrency(item.recargoMora)} ({item.porcentajeRecargo}%)
            </span>
          )}
        </div>
      ),
    },
    {
      id: "metodo",
      header: "Medio de Pago",
      cell: (item) => (
        <div>
          {item.metodoPago ? (
            <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-700">
              {item.metodoPago === "Efectivo" ? (
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              )}
              {item.metodoPago}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          )}
        </div>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge
          variant={
            item.estado === "Pagado"
              ? "success"
              : item.estado === "Pendiente"
              ? "warning"
              : "danger"
          }
          size="sm"
        >
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Efectivo en Caja Diaria
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {formatCurrency(totalEfectivo)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block flex items-center gap-1">
            <Banknote className="w-3 h-3 text-emerald-600" />
            Percibido en mostrador
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Transferencias Bancarias
          </span>
          <span className="text-2xl font-black text-blue-800 mt-1 block">
            {formatCurrency(totalTransferencia)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-600" />
            Conciliadas con BAPRO
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cuotas Pagadas en Término
          </span>
          <span className="text-2xl font-black text-[#00205B] mt-1 block">
            {pagadasCount}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Sin recargos por mora
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Meses Vencidos / En Mora
          </span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {vencidasCount}
          </span>
          <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
            +30% recargo aplicado
          </span>
        </div>
      </div>

      {/* FLUIDO CRÍTICO 1: COBRO RÁPIDO EN SECRETARÍA */}
      <CobroRapidoDesk onCobroRegistrado={(item) => setSelectedCob(item)} />

      {/* HISTORIAL GENERAL DE ARANCELES Y CAJA */}
      <DataTable
        title="Libro de Cobranzas y Aranceles"
        subtitle="Auditoría de pagos, estados de cuenta y reimpresión de comprobantes no fiscales"
        data={filteredCobranzas}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Emitir Cuota / Arancel"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onDelete={handleOpenDelete}
        extraFilters={
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            {["TODOS", "Pagado", "Pendiente", "Vencido"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  filterStatus === st
                    ? "bg-[#00205B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
        customRowActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenReceipt(item)}
              title="Emitir / Imprimir Recibo No Fiscal"
              className="px-2 py-1 rounded-lg bg-blue-50 text-[#00205B] hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Recibo</span>
            </button>
          </div>
        )}
        initialPageSize={8}
      />

      {/* MODAL: EMITIR CUOTA MANUAL */}
      <Modal
        isOpen={modalNewOpen}
        onClose={() => setModalNewOpen(false)}
        title="Emisión de Arancel / Cuota Individual"
        subtitle="Genere el devengamiento arancelario para un estudiante"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNewArancel} className="space-y-4 py-2">
          <Select
            label="Estudiante Titular"
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.nombreCompleto} (DNI ${e.dni}) - Curso: ${e.cursoActual}`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Concepto Arancelario"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              required
            />
            <Input
              label="Mes / Período Correspondiente"
              value={mesPeriodo}
              onChange={(e) => setMesPeriodo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Monto Base (ARS)"
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              required
            />
            <Input
              label="Recargo por Mora (ARS)"
              type="number"
              value={recargoMora}
              onChange={(e) => setRecargoMora(Number(e.target.value))}
            />
            <Input
              label="Fecha Límite Vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-xs flex justify-between items-center text-[#00205B]">
            <span>Total a devengar:</span>
            <span className="font-extrabold text-base">{formatCurrency(monto + recargoMora)}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModalNewOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Emitir Cuota
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCob?.reciboNumero || "Detalle de Comprobante"}
        maxWidth="md"
      >
        {selectedCob && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Recibo:</span>
                <span className="font-bold text-[#00205B]">{selectedCob.reciboNumero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estudiante:</span>
                <span className="font-bold text-slate-800">{selectedCob.estudianteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-mono">{selectedCob.estudianteDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Programa:</span>
                <span className="font-semibold text-slate-800">{selectedCob.cursoNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Concepto:</span>
                <span>{selectedCob.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto Base:</span>
                <span>{formatCurrency(selectedCob.montoBase)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recargo por Mora:</span>
                <span className="text-rose-600 font-bold">
                  {formatCurrency(selectedCob.recargoMora)} ({selectedCob.porcentajeRecargo}%)
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#00205B] pt-1 border-t">
                <span>Total Liquidado:</span>
                <span>{formatCurrency(selectedCob.totalAPagar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medio de Pago:</span>
                <span>{selectedCob.metodoPago || "Sin registrar"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operador:</span>
                <span>{selectedCob.cajeroResponsable || "Mariana Beltrán (Secretaría)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <Badge variant={selectedCob.estado === "Pagado" ? "success" : "danger"} size="sm">
                  {selectedCob.estado}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Button
                variant="coral"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  setReciboModalOpen(true);
                }}
                icon={<Printer className="w-4 h-4" />}
              >
                Imprimir Recibo No Fiscal
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* RECIBO OFICIAL NO FISCAL MODAL */}
      <ReciboNoFiscalModal
        isOpen={reciboModalOpen}
        onClose={() => setReciboModalOpen(false)}
        cobranza={selectedCob}
      />

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Anular Registro Arancelario?"
        description={`¿Confirma que desea anular el comprobante "${selectedCob?.reciboNumero}"?`}
        confirmText="Anular Comprobante"
      />
    </div>
  );
}
