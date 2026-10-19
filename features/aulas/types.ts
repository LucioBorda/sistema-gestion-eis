export type EstadoAula = "Disponible" | "En Mantenimiento";

export type InstrumentoDidactico =
  | "Smart TV 55\" / Pantalla Interactiva"
  | "Proyector Full HD"
  | "Biblioteca de Aula / Rincón Lector"
  | "Pizarra Blanca Magnética"
  | "Sistema de Audio Hi-Fi / Parlantes Bluetooth"
  | "Climatización Frío/Calor"
  | "Notebooks / Equipos Multimedia"
  | "Mobiliario Infantil / Mesas Grupales";

export interface Aula {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string;
  capacidadMaxima: number;
  instrumentosDidacticos: string[];
  estado: EstadoAula;
  observaciones?: string;
}
