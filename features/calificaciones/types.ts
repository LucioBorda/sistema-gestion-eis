export interface CalificacionItem {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  dni: string;
  comisionId: string;
  comisionNombre: string;
  materiaId: string;
  materiaNombre: string;
  primerParcial: number | null;
  segundoParcial: number | null;
  trabajosPracticos: number | null;
  examenFinal: number | null;
  promedioFinal: number | null;
  estadoAprobacion: "Aprobado" | "En Curso" | "Recuperatorio" | "Desaprobado";
  fechaUltimaCarga: string;
  observacionesDocente: string;
}
