"use client";

import React, { useState, useRef } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import {
  LandingPhotoItem,
  LandingGallerySection,
  GALLERY_SECTIONS,
} from "@/features/landing-cms/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function LandingCmsPage(): React.ReactElement {
  const {
    landingPhotos,
    addLandingPhoto,
    togglePhotoActive,
    deleteLandingPhoto,
    reorderPhoto,
  } = useGlobalData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("todas");
  const [livePreviewOpen, setLivePreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<LandingPhotoItem | null>(null);

  // Upload Form State
  const [titulo, setTitulo] = useState("");
  const [pieDeFoto, setPieDeFoto] = useState("");
  const [seccion, setSeccion] = useState<LandingGallerySection>("instalaciones");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreviewUrl(e.target.result as string);
        if (!titulo) {
          setTitulo(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreviewUrl) {
      alert("Por favor seleccione o arrastre una imagen.");
      return;
    }

    const newPhoto: LandingPhotoItem = {
      id: `pho-${Date.now()}`,
      titulo,
      pieDeFoto,
      seccion,
      imageUrl: imagePreviewUrl,
      activa: true,
      orden: landingPhotos.length + 1,
      fechaSubida: new Date().toISOString().slice(0, 10),
      autorSubida: currentUser.name,
    };

    addLandingPhoto(newPhoto);
    setTitulo("");
    setPieDeFoto("");
    setImagePreviewUrl(null);
    setUploadSuccessMsg(true);
    setTimeout(() => setUploadSuccessMsg(false), 4000);
  };

  const filteredPhotos =
    activeTab === "todas"
      ? landingPhotos
      : landingPhotos.filter((p) => p.seccion === activeTab);

  const activePhotos = landingPhotos.filter((p) => p.activa);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E63956] text-xs font-bold border border-rose-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Exclusivo Directora General & Rectoría
          </div>
          <h1 className="text-xl font-bold text-[#00205B]">
            Gestor Dinámico de Fotos de la Landing Page
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publique, reordene y oculte fotografías institucionales sincronizadas en tiempo real con la web pública
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLivePreviewOpen(true)}
            icon={<Monitor className="w-4 h-4 text-[#00205B]" />}
          >
            Vista Previa en Vivo (Mockup)
          </Button>
          <Link href="/" target="_blank">
            <Button
              variant="coral"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Abrir Web Pública
            </Button>
          </Link>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Fotografía incorporada con éxito y publicada automáticamente en la Landing Page!
        </div>
      )}

      {/* Grid: Upload Dropzone & Gallery Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Drag & Drop Image Uploader */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#00205B] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#E63956]" />
            Subir Nueva Fotografía
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                  ? "border-[#E63956] bg-rose-50/50"
                  : imagePreviewUrl
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {imagePreviewUrl ? (
                <div className="space-y-3">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-200"
                  />
                  <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Imagen cargada correctamente (Clic para cambiar)
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00205B] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Upload className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Arrastre su foto aquí o haga clic para buscar
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Formatos JPG, PNG, WebP (Se convertirá a Base64 local)
                  </span>
                </div>
              )}
            </div>

            <Select
              label="Sección de Destino en la Landing Page"
              value={seccion}
              onChange={(e) => setSeccion(e.target.value as LandingGallerySection)}
              options={GALLERY_SECTIONS.map((sec) => ({
                value: sec.id,
                label: sec.nombre,
              }))}
            />

            <Input
              label="Título de la Fotografía"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="ej: Laboratorio Multimedia de Idiomas"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pie de Foto / Epígrafe Descriptivo
              </label>
              <textarea
                rows={2}
                value={pieDeFoto}
                onChange={(e) => setPieDeFoto(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                placeholder="Breve reseña que aparecerá debajo de la imagen en la galería..."
                required
              />
            </div>

            <Button
              type="submit"
              variant="coral"
              size="md"
              className="w-full font-bold shadow-md shadow-[#E63956]/20"
              icon={<FolderPlus className="w-4 h-4" />}
            >
              Publicar Fotografía en la Landing
            </Button>
          </form>
        </div>

        {/* Right Column (7 cols): Gallery Cards & Status Toggles */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#E63956]" />
                Galería Administrable ({filteredPhotos.length} fotos)
              </h2>
              <span className="text-[11px] text-slate-400">
                {activePhotos.length} fotos actualmente visibles para los visitantes
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("todas")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === "todas"
                    ? "bg-[#00205B] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todas
              </button>
              {GALLERY_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveTab(sec.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    activeTab === sec.id
                      ? "bg-[#00205B] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sec.nombre.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-150 flex flex-col justify-between ${
                  photo.activa
                    ? "border-slate-200 bg-white shadow-xs hover:shadow-md"
                    : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={photo.imageUrl}
                      alt={photo.titulo}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                        {photo.seccion}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={photo.activa ? "success" : "default"} size="sm">
                        {photo.activa ? "Visible" : "Oculta"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                      {photo.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {photo.pieDeFoto}
                    </p>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reorderPhoto(photo.id, "up")}
                      title="Mover hacia arriba"
                      className="p-1 rounded text-slate-500 hover:text-[#00205B] hover:bg-slate-200"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => reorderPhoto(photo.id, "down")}
                      title="Mover hacia abajo"
                      className="p-1 rounded text-slate-500 hover:text-[#00205B] hover:bg-slate-200"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePhotoActive(photo.id)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        photo.activa
                          ? "text-slate-600 hover:bg-slate-200"
                          : "text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                      }`}
                      title={photo.activa ? "Ocultar de la web" : "Hacer visible en la web"}
                    >
                      {photo.activa ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPhotoToDelete(photo);
                        setConfirmDeleteOpen(true);
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      title="Eliminar fotografía"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: LIVE PREVIEW MOCKUP */}
      <Modal
        isOpen={livePreviewOpen}
        onClose={() => setLivePreviewOpen(false)}
        title="Live Preview Mockup · Vista Previa en Vivo de la Landing Page"
        subtitle="Simulación exacta de cómo la comunidad visualiza la galería fotográfica de EIS Institute"
        maxWidth="5xl"
      >
        <div className="space-y-4">
          {/* Device switcher bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Modo de Previsualización:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-[#00205B] text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Escritorio</span>
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-[#00205B] text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil</span>
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div
            className={`mx-auto bg-white rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 max-h-[600px] overflow-y-auto ${
              previewDevice === "mobile" ? "max-w-sm" : "w-full"
            }`}
          >
            {/* Mockup Header */}
            <div className="bg-[#00205B] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white text-[#00205B] flex items-center justify-center font-black text-xs border border-[#E63956]">
                  EIS
                </div>
                <span className="font-extrabold text-sm tracking-tight">EIS INSTITUTE</span>
              </div>
              <span className="text-[10px] text-slate-300 uppercase">Ensenada</span>
            </div>

            {/* Gallery Mockup Content */}
            <div className="p-6 space-y-8 bg-[#F8F9FA]">
              <div className="text-center max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E63956]">
                  Nuestras Instalaciones y Logros
                </span>
                <h3 className="text-xl font-extrabold text-[#00205B] mt-1">
                  Galería Oficial de Actividades
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fotos gestionadas en tiempo real por Dirección General
                </p>
              </div>

              {/* Sections Rendered */}
              {GALLERY_SECTIONS.map((sec) => {
                const secPhotos = landingPhotos.filter(
                  (p) => p.seccion === sec.id && p.activa
                );
                if (secPhotos.length === 0) return null;

                return (
                  <div key={sec.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                      <h4 className="text-xs font-bold text-[#00205B] uppercase tracking-wide">
                        {sec.nombre}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        ({secPhotos.length})
                      </span>
                    </div>

                    <div
                      className={`grid gap-3 ${
                        previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-3"
                      }`}
                    >
                      {secPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.titulo}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2.5">
                            <h5 className="font-bold text-xs text-slate-900 truncate">
                              {photo.titulo}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                              {photo.pieDeFoto}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setLivePreviewOpen(false)}>
              Cerrar Vista Previa
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (photoToDelete) {
            deleteLandingPhoto(photoToDelete.id);
          }
          setConfirmDeleteOpen(false);
        }}
        title="¿Eliminar Fotografía de la Galería?"
        description={`¿Confirma que desea eliminar permanentemente la imagen "${photoToDelete?.titulo}"?`}
        confirmText="Eliminar Imagen"
      />
    </div>
  );
}
