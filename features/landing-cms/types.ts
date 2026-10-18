export type LandingGallerySection =
  | "instalaciones"
  | "orgullo"
  | "eventos"
  | "vida";

export interface LandingPhotoItem {
  id: string;
  titulo: string;
  pieDeFoto: string;
  seccion: LandingGallerySection;
  imageUrl: string;
  activa: boolean;
  orden: number;
  fechaSubida: string;
  autorSubida: string;
}

export interface SectionMetadata {
  id: LandingGallerySection;
  nombre: string;
  descripcion: string;
  icono: string;
}

export const GALLERY_SECTIONS: SectionMetadata[] = [
  {
    id: "instalaciones",
    nombre: "Instalaciones y Aulas",
    descripcion: "Sede La Paz Nº 525, aulas climatizadas, laboratorio multimedia y biblioteca bilingüe.",
    icono: "Building2",
  },
  {
    id: "orgullo",
    nombre: "Orgullo EIS / Logros",
    descripcion: "Abanderados, distinciones internacionales Anglia, convenios y premios académicos.",
    icono: "Trophy",
  },
  {
    id: "eventos",
    nombre: "Eventos y Actos Anglia",
    descripcion: "Ceremonias de graduación, sesiones de exámenes internacionales y Open Classes.",
    icono: "Award",
  },
  {
    id: "vida",
    nombre: "Vida Estudiantil",
    descripcion: "Talleres lúdicos, teatro en inglés, ferias de ciencias y proyectos comunitarios.",
    icono: "Sparkles",
  },
];
