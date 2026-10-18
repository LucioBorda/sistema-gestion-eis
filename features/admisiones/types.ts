export type EstadoPostulante =
  | "Postulante"
  | "Test Pendiente"
  | "Test en Corrección"
  | "Pre-Alumno"
  | "Alumno Activo"
  | "Ex-Alumno"
  | "Inactivo";

export type FranjaEtaria = "Children" | "Juniors" | "Adults";

export type ModalidadRinde = "En el momento" | "Fecha futura";

export interface ExamenDigitalizado {
  id: string;
  fechaSubida: string;
  imagenUrl: string;
  nombreArchivo: string;
  paginasCount: number;
}

export interface ResultadoCorreccion {
  fechaCorreccion: string;
  correctora: string; // ej: "Directora Lic. Patricia Cullen"
  calificacion: string; // ej: "92/100 (Merit Distinction)"
  nivelAsignado: string; // Uno de los 19 cursos oficiales (ej: "JUNIORS 2")
  observaciones: string;
}

export interface PostulanteItem {
  id: string;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email: string;
  edad: number;
  franjaEtaria: FranjaEtaria;
  estado: EstadoPostulante;
  modalidadRinde: ModalidadRinde;
  fechaAgendadaTest?: string | null;
  horaAgendadaTest?: string | null;
  examenDigitalizado?: ExamenDigitalizado | null;
  resultadoCorreccion?: ResultadoCorreccion | null;
  cursoInscritoId?: string | null;
  comisionInscritaId?: string | null;
  fechaRegistro: string;
  observaciones: string;
}

export interface CondicionesCursada {
  asistenciaMinima: string;
  plazoCorreccion: string;
  documentacionExigida: string[];
}
