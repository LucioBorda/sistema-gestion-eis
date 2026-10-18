"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGlobalData } from "@/features/core/DataContext";
import { GALLERY_SECTIONS, LandingGallerySection } from "@/features/landing-cms/types";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PublicLandingPage(): React.ReactElement {
  const { landingPhotos, institucion, nivelesTurnos } = useGlobalData();
  const [selectedGallerySection, setSelectedGallerySection] = useState<string>("todas");
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string;
    title: string;
    caption: string;
  } | null>(null);

  const activePhotos = landingPhotos.filter((p) => p.activa);

  const displayedPhotos =
    selectedGallerySection === "todas"
      ? activePhotos
      : activePhotos.filter((p) => p.seccion === selectedGallerySection);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-[#00205B] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-[#00153D] text-white py-2 px-4 text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Matriculaciones Ciclo Lectivo 2026 abiertas · Sede Central Calle La Paz Nº 525 (Ensenada)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>Tel: (0221) 469-5201</span>
            <span>·</span>
            <span>Centro Oficial Anglia: AR-ENS-084</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00205B] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#E63956]">
              EIS
            </div>
            <div>
              <div className="font-black text-lg tracking-tight text-[#00205B] leading-none">
                EIS INSTITUTE
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Cultural Inglesa de Ensenada
              </div>
              <div className="text-[10px] text-[#E63956] font-semibold">
                Convenios Oficiales Anglia & UTN
              </div>
            </div>
          </Link>

          {/* Navigation Links Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
            <a href="#nosotros" className="hover:text-[#00205B] transition-colors">
              Nosotros
            </a>
            <a href="#cursos" className="hover:text-[#00205B] transition-colors">
              Niveles y Cursos
            </a>
            <a href="#convenios" className="hover:text-[#00205B] transition-colors">
              Convenios Internacionales
            </a>
            <a href="#galeria" className="hover:text-[#E63956] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E63956]" />
              Galería en Vivo
            </a>
            <a href="#contacto" className="hover:text-[#00205B] transition-colors">
              Contacto
            </a>
          </nav>

          {/* Right Action: Access System Button */}
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button
                variant="primary"
                size="md"
                icon={<Lock className="w-4 h-4" />}
                className="font-bold shadow-md shadow-[#00205B]/20"
              >
                Acceso al Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-[#F8F9FA] pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00205B]/10 text-[#00205B] text-xs font-bold border border-[#00205B]/20">
                <Award className="w-4 h-4 text-[#E63956]" />
                Centro Oficial Examinador Internacional Anglia Examinations England
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#00205B] tracking-tight leading-[1.15]">
                Excelencia, tradición y vanguardia en la enseñanza del{" "}
                <span className="text-[#E63956]">Idioma Inglés</span> en Ensenada
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Desde 1988 formamos generaciones bilingües. Trayectos académicos integrales desde <strong>Playgroup (3 años)</strong> hasta el <strong>Profesorado Superior</strong> con certificación universitaria y aval de la <strong>Universidad Tecnológica Nacional (UTN)</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a href="#cursos">
                  <Button variant="coral" size="lg" className="font-bold shadow-lg shadow-[#E63956]/25">
                    Ver Oferta de Cursos 2026
                  </Button>
                </a>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<Lock className="w-4 h-4" />}
                    className="font-bold border-[#00205B]"
                  >
                    Portal Administrativo (Directora)
                  </Button>
                </Link>
              </div>

              {/* Fast Trust Badges */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-black text-[#00205B]">38+</div>
                  <div className="text-xs text-slate-500 font-medium">Años de Trayectoria</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#E63956]">98%</div>
                  <div className="text-xs text-slate-500 font-medium">Aprobación Anglia MCER</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#00205B]">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Docentes Titulados</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                  alt="Estudiantes graduados de EIS Institute con diplomas Anglia"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00205B]/90 via-[#00205B]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-[#E63956] text-[10px] font-bold uppercase tracking-wider">
                    Orgullo EIS Institute
                  </span>
                  <h3 className="text-lg font-bold mt-2">
                    Ceremonia Anual de Certificaciones Internacionales
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Entrega de diplomas Anglia homologados por Chichester College (Inglaterra)
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 max-w-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#E63956]" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Sede Histórica</div>
                  <div className="text-slate-500 text-[11px]">Calle La Paz Nº 525, Ensenada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: GALERÍA DINÁMICA DE LA DIRECTORA */}
      <section id="galeria" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E63956] text-xs font-bold border border-rose-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Sincronización en Tiempo Real
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#00205B] tracking-tight">
                Galería Institucional y Vida Estudiantil
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Fotografías de nuestras instalaciones, actividades áulicas y eventos de colación actualizadas directamente por la Dirección General de EIS Institute.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto text-xs">
              <button
                type="button"
                onClick={() => setSelectedGallerySection("todas")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  selectedGallerySection === "todas"
                    ? "bg-[#00205B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todas ({activePhotos.length})
              </button>
              {GALLERY_SECTIONS.map((sec) => {
                const count = activePhotos.filter((p) => p.seccion === sec.id).length;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedGallerySection(sec.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      selectedGallerySection === sec.id
                        ? "bg-[#00205B] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sec.nombre} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() =>
                  setLightboxPhoto({
                    url: photo.imageUrl,
                    title: photo.titulo,
                    caption: photo.pieDeFoto,
                  })
                }
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={photo.imageUrl}
                    alt={photo.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#00205B]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {photo.seccion}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-sm text-[#00205B] group-hover:text-[#E63956] transition-colors leading-snug">
                    {photo.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {photo.pieDeFoto}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Publicado por: {photo.autorSubida}</span>
                    <span className="font-semibold text-[#00205B] group-hover:underline">
                      Ampliar imagen →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-700">¿Desea actualizar o agregar nuevas fotos a esta galería?</span>
              <p className="text-[11px] mt-0.5">Acceda con el rol de Directora al panel administrativo y utilice el Gestor Dinámico de Fotos.</p>
            </div>
            <Link href="/admin/landing-cms">
              <Button variant="outline" size="sm" icon={<Lock className="w-3.5 h-3.5" />}>
                Ir al Gestor CMS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: OFERTA DE CURSOS Y NIVELES */}
      <section id="cursos" className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#E63956] uppercase tracking-wider">
              Propuesta Académica 2026
            </span>
            <h2 className="text-3xl font-black text-[#00205B] mt-1 tracking-tight">
              Cursos y Niveles de Inglés para Todas las Edades
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Desde la estimulación temprana hasta la profesionalización docente y cursos técnicos específicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nivelesTurnos.map((nivel) => (
              <div
                key={nivel.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#00205B] border border-blue-200 font-mono">
                      {nivel.codigo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {nivel.edadesSugeridas}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#00205B] mb-2">{nivel.nombre}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {nivel.descripcion}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turnos:</span>
                    <span className="font-semibold text-slate-800">
                      {nivel.turnosDisponibles.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duración:</span>
                    <span className="font-semibold text-slate-800">{nivel.duracionAnios} años</span>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-[#00205B] bg-slate-50 p-2 rounded-lg border">
                    🎓 Certificación: {nivel.certificacionFinal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: CONVENIOS OFICIALES */}
      <section id="convenios" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#E63956] uppercase tracking-wider">
              Alianzas y Avales Académicos
            </span>
            <h2 className="text-3xl font-black text-[#00205B] mt-1 tracking-tight">
              Convenios Anglia Examinations & UTN
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Nuestros certificados cuentan con validez internacional homologada en el Marco Común Europeo de Referencia (MCER).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#00205B] text-white flex items-center justify-center font-bold text-lg mb-4">
                  ANG
                </div>
                <h3 className="text-lg font-bold text-[#00205B]">
                  Anglia Examinations England (AR-ENS-084)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  EIS Institute es sede examinadora oficial en Ensenada. Evaluaciones internacionales administradas por examinadores británicos avalados por Chichester College (Reino Unido), con niveles desde First Step hasta Proficiency (C2).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-100 flex items-center justify-between text-xs font-semibold text-[#00205B]">
                <span>Próxima sesión escrita: Noviembre 2026</span>
                <span>Validez MCER Internacional</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-50 to-white border-2 border-rose-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E63956] text-white flex items-center justify-center font-bold text-lg mb-4">
                  UTN
                </div>
                <h3 className="text-lg font-bold text-[#00205B]">
                  Universidad Tecnológica Nacional (UTN - FRLP)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Convenio institucional de extensión universitaria para el dictado y aval del Profesorado Superior de Lengua Inglesa, trayectos de capacitación metodológica continua y certificaciones laborales técnicas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs font-semibold text-[#E63956]">
                <span>Homologación de Cargas Horarias</span>
                <span>Resolución UTN-EIS 2024</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CONTACTO & SEDE */}
      <section id="contacto" className="py-16 bg-[#00153D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#00205B] flex items-center justify-center font-black text-xl border-2 border-[#E63956]">
                  EIS
                </div>
                <div>
                  <div className="font-black text-lg tracking-tight">EIS INSTITUTE</div>
                  <div className="text-[10px] text-slate-300 uppercase">
                    Cultural Inglesa de Ensenada Asociación Civil
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Institución dedicada a la enseñanza y difusión de la lengua y cultura inglesa desde el corazón histórico de Ensenada.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>CUIT: {institucion.cuit}</div>
                <div>Personería Jurídica: {institucion.resolucionMinisterial}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#E63956]">
                Sede Central
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{institucion.sedePrincipal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{institucion.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{institucion.emailOficial}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#E63956]">
                Plataforma Interna
              </div>
              <div className="space-y-2 text-xs">
                <Link
                  href="/login"
                  className="block p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  🔒 Acceso Directora / Personal
                </Link>
                <Link
                  href="/admin/landing-cms"
                  className="block p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  📸 Gestor de Fotos Landing
                </Link>
                <Link
                  href="/admin/cobranzas"
                  className="block p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  💳 Módulo de Pagos y Caja
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            © 2026 Cultural Inglesa de Ensenada (EIS Institute) · Todos los derechos reservados · Sistema Integral de Gestión Académica y Administrativa v3.1
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="w-full max-h-[75vh] object-contain bg-slate-950"
            />
            <div className="p-6 bg-white">
              <h3 className="text-lg font-bold text-[#00205B]">{lightboxPhoto.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {lightboxPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
