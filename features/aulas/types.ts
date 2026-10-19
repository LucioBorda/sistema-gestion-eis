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
  horarioInicio: string; // Franja horaria de apertura/inicio (ej: "16:00")
  horarioFin: string; // Franja horaria de cierre/fin (ej: "21:30")
  diasPermitidos?: string[]; // Días en los que el aula está operativa para clases
  instrumentosDidacticos: string[];
  estado: EstadoAula;
  observaciones?: string;
}
