export type CicloLectivoStatus = "Vigente" | "Cerrado" | "Planificado";

export interface CicloLectivo {
  id: string;
  year: number;
  nombre: string;
  fechaInicio: string;
  fechaCierre: string;
  status: CicloLectivoStatus;
  matriculacionAbierta: boolean;
  totalAlumnosInscritos: number;
  observaciones: string;
}
