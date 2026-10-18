"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { CobranzaItem, MetodoCobro, EstadoPago } from "@/features/cobranzas/types";
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
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function CobranzasPage(): React.ReactElement {
  const { cobranzas, estudiantes, addCobranza, registrarPago, deleteCobranza } =
    useGlobalData();
  const { currentUser } = useAuth();

  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [modalPayOpen, setModalPayOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedCob, setSelectedCob] = useState<CobranzaItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");

  // Form State: Nuevo Arancel
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [concepto, setConcepto] = useState("Cuota Arancelaria Noviembre 2026");
  const [mesPeriodo, setMesPeriodo] = useState("Noviembre 2026");
  const [monto, setMonto] = useState(28500);
  const [recargoMora, setRecargoMora] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState("2026-11-10");

  // Form State: Cobro Rápido
  const [metodoPagoCobro, setMetodoPagoCobro] = useState<MetodoCobro>("Efectivo");
  const [comprobanteRef, setComprobanteRef] = useState("");

  const handleOpenNew = () => {
    setSelectedCob(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setConcepto("Cuota Arancelaria Noviembre 2026");
    setMesPeriodo("Noviembre 2026");
    setMonto(28500);
    setRecargoMora(0);
    setFechaVencimiento("2026-11-10");
    setModalNewOpen(true);
  };

  const handleOpenPayModal = (item: CobranzaItem) => {
    setSelectedCob(item);
    setMetodoPagoCobro("Efectivo");
    setComprobanteRef(`REC-${Date.now().toString().slice(-5)}`);
    setModalPayOpen(true);
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

    const reciboNumero = `REC-2026-${String(cobranzas.length + 420).padStart(5, "0")}`;
    const totalAPagar = monto + recargoMora;

    const newCob: CobranzaItem = {
      id: `cob-${Date.now()}`,
      reciboNumero,
      estudianteId,
      estudianteNombre,
      estudianteDni,
      concepto,
      mesPeriodo,
      monto,
      recargoMora,
      totalAPagar,
      fechaVencimiento,
      fechaPago: null,
      metodoPago: null,
      cajeroResponsable: null,
      estado: "Pendiente",
      comprobanteReferencia: null,
      observaciones: "Arancel mensual emitido por tesorería.",
    };

    addCobranza(newCob);
    setModalNewOpen(false);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCob) return;

    registrarPago(
      selectedCob.id,
      metodoPagoCobro,
      comprobanteRef,
      `${currentUser.name} (${currentUser.role})`
    );

    setModalPayOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCob) {
      deleteCobranza(selectedCob.id);
    }
    setConfirmDeleteOpen(false);
  };

  // Recibo Oficial de Caja en PDF
  const handlePrintOfficialReceipt = (item: CobranzaItem) => {
    const htmlBody = `
      <div style="font-size: 13px; line-height: 1.6;">
        <div style="border: 2px solid #00205B; border-radius: 8px; padding: 20px; background: #fafafa;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #00205B; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Comprobante Oficial de Caja</span>
              <h2 style="margin: 2px 0 0 0; color: #00205B; font-size: 22px; font-weight: 900;">${item.reciboNumero}</h2>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; color: #64748b;">Fecha de Operación</span>
              <div style="font-weight: bold; color: #1e293b;">${item.fechaPago ? formatDate(item.fechaPago) : formatDate(new Date().toISOString())}</div>
              <div style="font-size: 11px; color: #E63956; font-weight: bold;">ORIGINAL - CLIENTE</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #fff;">
            <tbody>
              <tr>
                <td style="padding: 6px 12px; font-weight: bold; width: 30%;">Estudiante:</td>
                <td style="padding: 6px 12px;">${item.estudianteNombre} (DNI ${item.estudianteDni})</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; font-weight: bold;">Concepto Arancelario:</td>
                <td style="padding: 6px 12px;">${item.concepto}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; font-weight: bold;">Período / Mes:</td>
                <td style="padding: 6px 12px;">${item.mesPeriodo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; font-weight: bold;">Medio de Cancelación:</td>
                <td style="padding: 6px 12px;">${item.metodoPago || "Efectivo en Ventanilla"} (Ref: ${item.comprobanteReferencia || "CAJA-ENSENADA"})</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; font-weight: bold;">Cajero Operador:</td>
                <td style="padding: 6px 12px;">${item.cajeroResponsable || "Mariana Beltrán (Secretaría)"}</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #00205B; color: white; padding: 12px 18px; border-radius: 6px;">
            <span style="font-size: 14px; font-weight: bold;">TOTAL PERCIBIDO EN CONCEPTO DE ARANCEL:</span>
            <span style="font-size: 20px; font-weight: 900;">${formatCurrency(item.totalAPagar)}</span>
          </div>

          <div style="margin-top: 24px; font-size: 10px; color: #64748b; text-align: center;">
            Cultural Inglesa de Ensenada (EIS Institute) · Personería Jurídica DGCyE Nº 4812/98 · Calle La Paz Nº 525 · Ensenada
          </div>
        </div>
      </div>
    `;
    openInstitutionalPrintPreview(`Recibo_Oficial_${item.reciboNumero}`, htmlBody);
  };

  const filteredCobranzas =
    filterStatus === "TODOS"
      ? cobranzas
      : cobranzas.filter((c) => c.estado === filterStatus);

  const handleExportExcel = () => {
    exportToExcelCSV(
      "libro_caja_aranceles_eis",
      [
        { header: "Recibo Nº", accessor: "reciboNumero" },
        { header: "Estudiante", accessor: "estudianteNombre" },
        { header: "DNI", accessor: "estudianteDni" },
        { header: "Concepto", accessor: "concepto" },
        { header: "Monto", accessor: (c) => formatCurrency(c.monto) },
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
      <p style="font-size: 13px;">Libro Diario de Caja y Estado Arancelario - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Recibo Nº</th>
            <th>Estudiante</th>
            <th>Concepto</th>
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
              <td>${c.concepto}</td>
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
    openInstitutionalPrintPreview("Libro Diario de Cobranzas y Caja", htmlBody);
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
      header: "Estudiante / Titular",
      accessorKey: "estudianteNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.estudianteNombre}</span>
          <span className="text-[11px] font-mono text-slate-400">DNI {item.estudianteDni}</span>
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
              + {formatCurrency(item.recargoMora)} mora
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
      <DataTable
        title="Pago de Cuotas y Caja"
        subtitle="Control de aranceles, cobro rápido en ventanilla/transferencia y emisión de recibos oficiales"
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
            {item.estado !== "Pagado" && (
              <button
                onClick={() => handleOpenPayModal(item)}
                title="Cobrar en Ventanilla / Asentar Transferencia"
                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Cobrar</span>
              </button>
            )}
            <button
              onClick={() => handlePrintOfficialReceipt(item)}
              title="Emitir Recibo Oficial PDF"
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#00205B] hover:bg-blue-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#00205B]" />
            </button>
          </div>
        )}
        initialPageSize={8}
      />

      {/* MODAL: EMITIR CUOTA / ARANCEL */}
      <Modal
        isOpen={modalNewOpen}
        onClose={() => setModalNewOpen(false)}
        title="Emisión de Arancel / Cuota"
        subtitle="Genere el devengamiento de arancel para un estudiante"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNewArancel} className="space-y-4 py-2">
          <Select
            label="Estudiante"
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
              label="Fecha Límite de Vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-xs flex justify-between items-center text-[#00205B]">
            <span>Total devengado:</span>
            <span className="font-extrabold text-base">{formatCurrency(monto + recargoMora)}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModalNewOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Emitir Arancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: COBRO RÁPIDO */}
      <Modal
        isOpen={modalPayOpen}
        onClose={() => setModalPayOpen(false)}
        title="Registro de Cobro Rápido"
        subtitle={`Asentar cobranza para ${selectedCob?.estudianteNombre}`}
        maxWidth="md"
      >
        {selectedCob && (
          <form onSubmit={handleConfirmPayment} className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Recibo:</span>
                <span className="font-bold text-[#00205B]">{selectedCob.reciboNumero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-semibold">{selectedCob.concepto}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">Total a Percibir:</span>
                <span className="text-lg font-black text-emerald-700">
                  {formatCurrency(selectedCob.totalAPagar)}
                </span>
              </div>
            </div>

            <Select
              label="Método de Pago Utilizado"
              value={metodoPagoCobro}
              onChange={(e) => setMetodoPagoCobro(e.target.value as MetodoCobro)}
              options={[
                { value: "Efectivo", label: "Efectivo en Ventanilla" },
                { value: "Transferencia", label: "Transferencia Bancaria Inmediata" },
                { value: "Tarjeta Débito", label: "Tarjeta de Débito (Posnet)" },
                { value: "Tarjeta Crédito", label: "Tarjeta de Crédito" },
              ]}
            />

            <Input
              label="Comprobante / Nº Transacción de Referencia"
              value={comprobanteRef}
              onChange={(e) => setComprobanteRef(e.target.value)}
              placeholder="ej: TRF-BAPRO-91823"
              required
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setModalPayOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                Confirmar y Emitir Recibo
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCob?.reciboNumero || "Detalle de Recibo"}
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
                <span className="text-slate-500">Concepto:</span>
                <span>{selectedCob.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Período:</span>
                <span>{selectedCob.mesPeriodo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto Base:</span>
                <span>{formatCurrency(selectedCob.monto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recargo por Mora:</span>
                <span>{formatCurrency(selectedCob.recargoMora)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#00205B] pt-1 border-t">
                <span>Total:</span>
                <span>{formatCurrency(selectedCob.totalAPagar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medio de Pago:</span>
                <span>{selectedCob.metodoPago || "Sin registrar"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operador:</span>
                <span>{selectedCob.cajeroResponsable || "-"}</span>
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
                variant="outline"
                size="sm"
                onClick={() => {
                  handlePrintOfficialReceipt(selectedCob);
                  setDetailModalOpen(false);
                }}
                icon={<Printer className="w-4 h-4 text-[#00205B]" />}
              >
                Imprimir Recibo Oficial
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
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
        title="¿Anular Registro Arancelario?"
        description={`¿Confirma que desea anular el comprobante "${selectedCob?.reciboNumero}"?`}
        confirmText="Anular Comprobante"
      />
    </div>
  );
}
