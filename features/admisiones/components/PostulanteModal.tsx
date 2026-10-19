"use client";

import React, { useState } from "react";
import { PostulanteItem, FranjaEtaria, ModalidadRinde } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UserPlus, Calendar, Clock, CheckCircle2, Printer, Sparkles } from "lucide-react";

interface PostulanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postulante: PostulanteItem, imprimirInmediato: boolean) => void;
}

export const PostulanteModal: React.FC<PostulanteModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [edad, setEdad] = useState<number>(12);
  const [franjaEtaria, setFranjaEtaria] = useState<FranjaEtaria>("Juniors");
  const [modalidadRinde, setModalidadRinde] = useState<ModalidadRinde>("En el momento");
  const [fechaAgendada, setFechaAgendada] = useState("2026-10-22");
  const [horaAgendada, setHoraAgendada] = useState("18:00");
  const [observaciones, setObservaciones] = useState("");

  const handleEdadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setEdad(val);
    if (val < 11) {
      setFranjaEtaria("Children");
    } else if (val <= 15) {
      setFranjaEtaria("Juniors");
    } else {
      setFranjaEtaria("Adults");
    }
  };

  const handleSubmit = (e: React.FormEvent, imprimir: boolean = false) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim() || !dni.trim()) {
      alert("Por favor complete nombre(s), apellido(s) y DNI del aspirante.");
      return;
    }

    const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`;

    const newPostulante: PostulanteItem = {
      id: `pos-${Date.now()}`,
      nombreCompleto,
      dni,
      telefono,
      email,
      edad,
      franjaEtaria,
      estado: "Test Pendiente",
      modalidadRinde,
      fechaAgendadaTest: modalidadRinde === "Fecha futura" ? fechaAgendada : null,
      horaAgendadaTest: modalidadRinde === "Fecha futura" ? horaAgendada : null,
      fechaRegistro: new Date().toISOString().slice(0, 10),
      observaciones: observaciones || "Postulante registrado en Secretaría.",
    };

    onSave(newPostulante, imprimir);
    handleReset();
  };

  const handleReset = () => {
    setNombres("");
    setApellidos("");
    setDni("");
    setTelefono("");
    setEmail("");
    setEdad(12);
    setFranjaEtaria("Juniors");
    setModalidadRinde("En el momento");
    setObservaciones("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Precarga de Postulante / Lead"
      subtitle="Registro del aspirante para el circuito del Test Nivelatorio Oficial"
      maxWidth="2xl"
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5 py-2">
        {/* Fila 1: Nombres, Apellidos y DNI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Nombre(s) del Aspirante"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="ej: Mateo Ignacio"
            required
          />
          <Input
            label="Apellido(s) del Aspirante"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            placeholder="ej: Fernández Gómez"
            required
          />
          <Input
            label="DNI / Documento de Identidad"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="ej: 48.912.445"
            required
          />
        </div>

        {/* Fila 2: Teléfono, Email y Edad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Teléfono / WhatsApp"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="ej: (0221) 15-492-3344"
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: aspirante@gmail.com"
          />
          <Input
            label="Edad Cumplida (Años)"
            type="number"
            value={edad}
            onChange={handleEdadChange}
            required
          />
        </div>

        {/* Fila 3: Franja Etaria Sugerida */}
        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              Franja Etaria Asignada:
            </span>
            <span className="text-base font-black text-[#00205B] mt-0.5 block">
              Nivel {franjaEtaria} ({edad} años)
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Calculada automáticamente según la edad ingresada.
            </span>
          </div>
          <div>
            <Select
              label="Modificar Franja si Corresponde"
              value={franjaEtaria}
              onChange={(e) => setFranjaEtaria(e.target.value as FranjaEtaria)}
              options={[
                { value: "Children", label: "Children (Niños 6 a 10 años)" },
                { value: "Juniors", label: "Juniors (Adolescentes 11 a 15 años)" },
                { value: "Adults", label: "Adults (Jóvenes y Adultos 16+)" },
              ]}
            />
          </div>
        </div>

        {/* Fila 4: ¿Rinde en el momento o fecha futura? */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800">
            ¿Rinde la Evaluación Nivelatoria en el momento o se agenda para fecha futura?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setModalidadRinde("En el momento")}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                modalidadRinde === "En el momento"
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Rinde en el Momento</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-500 block leading-relaxed">
                Rinde en mostrador de secretaría y se imprime test oficial con hoja de condiciones.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalidadRinde("Fecha futura")}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                modalidadRinde === "Fecha futura"
                  ? "border-[#00205B] bg-blue-50/70 text-[#00205B] shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Agendar Fecha Futura</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00205B]" />
              </div>
              <span className="text-xs text-slate-500 block leading-relaxed">
                Se agenda día y hora en el calendario interactivo de evaluaciones de Secretaría.
              </span>
            </button>
          </div>
        </div>

        {modalidadRinde === "Fecha futura" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <Input
              label="Fecha Programada del Test"
              type="date"
              value={fechaAgendada}
              onChange={(e) => setFechaAgendada(e.target.value)}
              required
            />
            <Input
              label="Hora del Turno"
              type="time"
              value={horaAgendada}
              onChange={(e) => setHoraAgendada(e.target.value)}
              required
            />
          </div>
        )}

        {/* Fila 5: Observaciones */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Notas de Orientación / Antecedentes Académicos
          </label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Conocimientos previos, colegio o instituto de procedencia, disponibilidad horaria..."
            className="w-full text-sm font-medium p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B] transition-colors"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleReset}
            className="w-full sm:w-auto justify-center"
          >
            Cancelar
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
            {modalidadRinde === "En el momento" && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={(e) => handleSubmit(e, true)}
                icon={<Printer className="w-4 h-4 text-[#00205B]" />}
                className="w-full sm:w-auto justify-center font-medium"
              >
                Guardar e Imprimir Test
              </Button>
            )}
            <Button
              type="submit"
              variant="coral"
              size="md"
              className="font-bold shadow-md shadow-[#E63956]/20 w-full sm:w-auto justify-center"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Registrar Postulante
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
