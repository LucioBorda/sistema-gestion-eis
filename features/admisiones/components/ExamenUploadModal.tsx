"use client";

import React, { useState, useRef } from "react";
import { PostulanteItem, ExamenDigitalizado } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, FileImage, CheckCircle2, AlertCircle } from "lucide-react";

interface ExamenUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteItem | null;
  onUploadConfirm: (postulanteId: string, examen: ExamenDigitalizado) => void;
}

export const ExamenUploadModal: React.FC<ExamenUploadModalProps> = ({
  isOpen,
  onClose,
  postulante,
  onUploadConfirm,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [paginas, setPaginas] = useState<number>(2);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!postulante) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      alert("Por favor seleccione una imagen (JPG, PNG) o escaneo del examen.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage =
      imagePreview ||
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80";

    const examen: ExamenDigitalizado = {
      id: `scan-${Date.now()}`,
      fechaSubida: new Date().toISOString().slice(0, 10),
      imagenUrl: finalImage,
      nombreArchivo: fileName || `examen_${postulante.nombreCompleto.toLowerCase().replace(/\s+/g, "_")}.jpg`,
      paginasCount: paginas,
    };

    onUploadConfirm(postulante.id, examen);
    handleReset();
  };

  const handleReset = () => {
    setImagePreview(null);
    setFileName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Carga y Digitalización del Examen Rendido"
      subtitle={`Subir examen físico escaneado para ${postulante.nombreCompleto} (DNI ${postulante.dni})`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Al confirmar la carga del examen, el estado del alumno pasará automáticamente a{" "}
            <strong>&quot;Test en Corrección&quot;</strong> y se notificará en la bandeja de la Directora.
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#00205B] bg-blue-50"
              : imagePreview
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {imagePreview ? (
            <div className="space-y-2">
              <img
                src={imagePreview}
                alt="Vista previa de examen físico"
                className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-200 mx-auto"
              />
              <div className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{fileName || "Archivo escaneado listo"}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Haga clic para cambiar o reintentar escaneo
              </span>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#00205B] flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="font-bold text-slate-800 block text-xs">
                Arrastre la fotografía o escaneo del examen manuscrito
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Formatos JPG, PNG, PDF (Hoja de respuestas y redacción)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Cantidad de Páginas / Hojas Escaneadas
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={paginas}
              onChange={(e) => setPaginas(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Nombre de Archivo de Auditoría
            </label>
            <input
              type="text"
              readOnly
              value={fileName || `examen_${postulante.dni}.jpg`}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleReset}
            className="w-full sm:w-auto justify-center"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="coral"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="w-full sm:w-auto justify-center font-bold"
          >
            Digitalizar y Enviar a Corrección
          </Button>
        </div>
      </form>
    </Modal>
  );
};
