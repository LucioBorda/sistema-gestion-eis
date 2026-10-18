import { TurnoType } from "../niveles-turnos/types";

export interface Comision {
  id: string;
  codigo: string;
  nombre: string;
  nivelId: string;
  nivelNombre: string;
  turno: TurnoType;
  diasHorarios: string;
  aulaFisica: string;
  cupoMaximo: number;
  cupoOcupado: number;
  activo: boolean;
}
