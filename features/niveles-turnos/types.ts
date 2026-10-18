export type TurnoType = "Mañana" | "Tarde" | "Vespertino";

export interface NivelTurno {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  edadesSugeridas: string;
  turnosDisponibles: TurnoType[];
  duracionAnios: number;
  activo: boolean;
  certificacionFinal: string;
}
