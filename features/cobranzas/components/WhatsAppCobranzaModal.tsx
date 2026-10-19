"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CobranzaItem } from "../types";
import { EstudianteItem } from "@/features/estudiantes/types";
import {
  cleanArgentineWhatsAppNumber,
  buildWhatsAppLink,
  generateWhatsAppMessage,
  WhatsAppTemplateKey,
} from "../whatsappUtils";
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Phone,
  User,
  Users,
  ShieldAlert,
  CalendarClock,
  Receipt,
  Landmark,
  RotateCcw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface WhatsAppCobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cobranza: CobranzaItem | null;
  estudiante?: EstudianteItem | null;
}

export const WhatsAppCobranzaModal: React.FC<WhatsAppCobranzaModalProps> = ({
  isOpen,
  onClose,
  cobranza,
  estudiante,
}) => {
  // Determine primary recipient type: tutor or student
  const [targetType, setTargetType] = useState<"tutor" | "estudiante" | "custom">("tutor");
  const [customPhone, setCustomPhone] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateKey>("recordatorio_mora");
  const [messageText, setMessageText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize template and recipient based on cobranza state
  useEffect(() => {
    if (!isOpen || !cobranza) return;

    // Pick default template
    let defaultTpl: WhatsAppTemplateKey = "aviso_vencimiento";
    if (cobranza.estado === "Vencido") {
      defaultTpl = "recordatorio_mora";
    } else if (cobranza.estado === "Pagado") {
      defaultTpl = "confirmacion_pago";
    } else {
      defaultTpl = "aviso_vencimiento";
    }
    setSelectedTemplate(defaultTpl);

    // Default recipient: if student has tutor phone, use tutor; else student
    if (estudiante?.tutorTelefono) {
      setTargetType("tutor");
    } else if (estudiante?.telefono) {
      setTargetType("estudiante");
    } else {
      setTargetType("custom");
    }

    setCustomPhone(estudiante?.tutorTelefono || estudiante?.telefono || "");
    setCopied(false);
  }, [isOpen, cobranza, estudiante]);

  // Active phone number
  const activePhone = useMemo(() => {
    if (targetType === "tutor") {
      return estudiante?.tutorTelefono || customPhone;
    }
    if (targetType === "estudiante") {
      return estudiante?.telefono || customPhone;
    }
    return customPhone;
  }, [targetType, estudiante, customPhone]);

  const activeRecipientName = useMemo(() => {
    if (targetType === "tutor") {
      return estudiante?.tutorResponsable || "Familia / Tutor Responsable";
    }
    if (targetType === "estudiante") {
      return estudiante?.nombreCompleto || cobranza?.estudianteNombre || "Estudiante";
    }
    return "Contacto Administrativo";
  }, [targetType, estudiante, cobranza]);

  // Update text when template or recipient change
  useEffect(() => {
    if (!cobranza) return;
    const msg = generateWhatsAppMessage(selectedTemplate, {
      destinatarioNombre: activeRecipientName,
      estudianteNombre: cobranza.estudianteNombre,
      cursoNombre: cobranza.cursoNombre,
      concepto: cobranza.concepto,
      montoTotal: cobranza.totalAPagar,
      reciboNumero: cobranza.reciboNumero,
      fechaVencimiento: cobranza.fechaVencimiento,
      metodoPago: cobranza.metodoPago || undefined,
    });
    setMessageText(msg);
  }, [selectedTemplate, activeRecipientName, cobranza]);

  const normalizedPhone = useMemo(() => {
    return cleanArgentineWhatsAppNumber(activePhone);
  }, [activePhone]);

  const whatsappUrl = useMemo(() => {
    return buildWhatsAppLink(activePhone, messageText);
  }, [activePhone, messageText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenWhatsApp = () => {
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleResetTemplate = () => {
    if (!cobranza) return;
    const msg = generateWhatsAppMessage(selectedTemplate, {
      destinatarioNombre: activeRecipientName,
      estudianteNombre: cobranza.estudianteNombre,
      cursoNombre: cobranza.cursoNombre,
      concepto: cobranza.concepto,
      montoTotal: cobranza.totalAPagar,
      reciboNumero: cobranza.reciboNumero,
      fechaVencimiento: cobranza.fechaVencimiento,
      metodoPago: cobranza.metodoPago || undefined,
    });
    setMessageText(msg);
  };

  if (!cobranza) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comunicación Oficial por WhatsApp"
      maxWidth="lg"
    >
      <div className="space-y-4 py-1 text-slate-800">
        {/* Banner de Identificación del Comprobante */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-emerald-950">
                  {cobranza.estudianteNombre}
                </span>
                <Badge
                  variant={
                    cobranza.estado === "Pagado"
                      ? "success"
                      : cobranza.estado === "Pendiente"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  {cobranza.estado}
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                {cobranza.concepto} · {formatCurrency(cobranza.totalAPagar)} · Recibo:{" "}
                <strong className="font-mono">{cobranza.reciboNumero}</strong>
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Vencimiento:</span>
            <span className="text-xs font-bold text-slate-700">
              {formatDate(cobranza.fechaVencimiento)}
            </span>
          </div>
        </div>

        {/* 1. Selector de Destinatario */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Destinatario del Mensaje:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Opción 1: Tutor */}
            <button
              type="button"
              onClick={() => setTargetType("tutor")}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                targetType === "tutor"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Tutor / Padre
                </span>
                {estudiante?.tutorTelefono && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                    Registrado
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate mt-1">
                {estudiante?.tutorResponsable || "Tutor Responsable"}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                {estudiante?.tutorTelefono || "Sin registrar"}
              </p>
            </button>

            {/* Opción 2: Alumno */}
            <button
              type="button"
              onClick={() => setTargetType("estudiante")}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                targetType === "estudiante"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Estudiante
                </span>
                {estudiante?.telefono && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                    Directo
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate mt-1">
                {cobranza.estudianteNombre}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                {estudiante?.telefono || "Sin registrar"}
              </p>
            </button>

            {/* Opción 3: Personalizado */}
            <button
              type="button"
              onClick={() => setTargetType("custom")}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                targetType === "custom"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Otro Número
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-1">Ingresar manual</p>
              <p className="text-[11px] text-slate-400">Celular o WhatsApp</p>
            </button>
          </div>

          {/* Input para número personalizado o si el contacto no tiene teléfono */}
          {targetType === "custom" && (
            <div className="pt-1">
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="ej: (0221) 15-492-3344 o 2215881122"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Formato de envío normalizado */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              Número destino:{" "}
              <strong className="font-mono text-slate-700">
                {activePhone || "Pendiente de ingreso"}
              </strong>
            </span>
            {normalizedPhone && (
              <span className="text-emerald-700 font-mono">
                WhatsApp Internacional: <strong>+{normalizedPhone}</strong>
              </span>
            )}
          </div>
        </div>

        {/* 2. Selector de Plantilla */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Seleccionar Plantilla Predefinida:
            </label>
            <button
              type="button"
              onClick={handleResetTemplate}
              className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer plantilla
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTemplate("recordatorio_mora")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTemplate === "recordatorio_mora"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Recordatorio de Mora</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate("aviso_vencimiento")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTemplate === "aviso_vencimiento"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Aviso de Vencimiento</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate("confirmacion_pago")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTemplate === "confirmacion_pago"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Confirmación de Pago & Recibo</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate("datos_bancarios")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTemplate === "datos_bancarios"
                  ? "bg-[#00205B] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Datos Bancarios BAPRO</span>
            </button>
          </div>
        </div>

        {/* 3. Editor del Mensaje */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700">
              Mensaje a Enviar (Personalizable antes de emitir):
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {messageText.length} caracteres
            </span>
          </div>

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={8}
            className="w-full p-3 text-xs leading-relaxed font-sans bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 resize-none"
          />

          <span className="text-[11px] text-slate-500 block">
            💡 <em>Tip de Secretaría:</em> Puede editar cualquier parte del texto o agregar
            aclaraciones personalizadas. Los asteriscos (*) se verán en <strong>negrita</strong> en
            WhatsApp.
          </span>
        </div>

        {/* 4. Barra de Acciones */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs"
          >
            {copied ? "¡Mensaje Copiado!" : "Copiar Texto al Portapapeles"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cerrar
            </Button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!normalizedPhone && !activePhone}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                !normalizedPhone && !activePhone
                  ? "bg-slate-400 cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30"
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Abrir chat de WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
