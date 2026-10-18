"use client";

import React, { useState } from "react";
import { PostulanteItem, FranjaEtaria, ModalidadRinde } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UserPlus, Calendar, Clock, CheckCircle2, Printer } from "lucide-react";

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
  const [nombreCompleto, setNombreCompleto] = useState("");
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
    if (!nombreCompleto || !dni) {
      alert("Por favor ingrese nombre y DNI del postulante.");
      return;
    }

    const newPostulante: PostulanteItem = {
      id: `pos-${Date.now()}`,
      nombreCompleto,
      dni,
      telefono,
      email,
      edad,
      franjaEtaria,
      estado: modalidadRinde === "En el momento" ? "Test Pendiente" : "Test Pendiente",
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
    setNombreCompleto("");
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
      title="Precarga Rápida de Postulante / Lead"
      subtitle="Registro ágil de aspirante y definición del circuito del Test Nivelatorio"
      maxWidth="lg"
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 py-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nombre Completo del Postulante"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="ej: Mateo Ignacio Fernández"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Teléfono / WhatsApp de Contacto"
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
            placeholder="ej: contacto@gmail.com"
          />
          <Input
            label="Edad Cumplida"
            type="number"
            value={edad}
            onChange={handleEdadChange}
            required
          />
        </div>

        {/* Franja Etaria Sugerida */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              Franja Etaria Asignada para el Test:
            </span>
            <span className="text-sm font-black text-[#00205B]">
              Nivel {franjaEtaria} ({edad} años)
            </span>
          </div>
          <Select
            label="Forzar Franja"
            value={franjaEtaria}
            onChange={(e) => setFranjaEtaria(e.target.value as FranjaEtaria)}
            options={[
              { value: "Children", label: "Children (Niños 6 a 10 años)" },
              { value: "Juniors", label: "Juniors (Adolescentes 11 a 15 años)" },
              { value: "Adults", label: "Adults (Jóvenes y Adultos 16+)" },
            ]}
          />
        </div>

        {/* Opción ¿Rinde en el momento o fecha futura? */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800">
            ¿Rinde la Evaluación Nivelatoria en el momento o se agenda para fecha futura?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModalidadRinde("En el momento")}
              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                modalidadRinde === "En el momento"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="font-bold block text-xs">Rinde en el Momento</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Se toma en mesa de secretaría y se imprime test oficial con hoja de condiciones.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModalidadRinde("Fecha futura")}
              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                modalidadRinde === "Fecha futura"
                  ? "border-[#00205B] bg-blue-50 text-[#00205B] shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="font-bold block text-xs">Agendar Fecha Futura</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Se incorpora al calendario de evaluaciones de Secretaría.
              </span>
            </button>
          </div>
        </div>

        {modalidadRinde === "Fecha futura" && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Input
              label="Fecha Programada del Test"
              type="date"
              value={fechaAgendada}
              onChange={(e) => setFechaAgendada(e.target.value)}
              required
            />
            <Input
              label="Hora del Test"
              type="time"
              value={horaAgendada}
              onChange={(e) => setHoraAgendada(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notas de Orientación / Observaciones
          </label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Antecedentes previos de inglés, colegio de origen, disponibilidad horaria..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {modalidadRinde === "En el momento" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => handleSubmit(e, true)}
                icon={<Printer className="w-4 h-4 text-[#00205B]" />}
              >
                Guardar e Imprimir Test Oficial
              </Button>
            )}
            <Button
              type="submit"
              variant="coral"
              size="sm"
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
