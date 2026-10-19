import { Aula } from "./types";

export const INSTRUMENTOS_DISPONIBLES: string[] = [
  "Smart TV 55\" / Pantalla Interactiva",
  "Proyector Full HD",
  "Biblioteca de Aula / Rincón Lector",
  "Pizarra Blanca Magnética",
  "Sistema de Audio Hi-Fi / Parlantes Bluetooth",
  "Climatización Frío/Calor",
  "Notebooks / Equipos Multimedia",
  "Mobiliario Infantil / Mesas Grupales",
];

/**
 * El instituto cuenta con exactamente 4 Aulas físicas en su sede central.
 * Cada una tiene asignada su capacidad física de cupos, inventario didáctico y franja horaria operativa.
 */
export const INITIAL_AULAS: Aula[] = [
  {
    id: "aula-1",
    codigo: "AULA-01",
    nombre: "Aula 1 (Planta Baja)",
    ubicacion: "Planta Baja - Sector Este",
    capacidadMaxima: 16,
    horarioInicio: "09:00",
    horarioFin: "21:30",
    diasPermitidos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    instrumentosDidacticos: [
      "Smart TV 55\" / Pantalla Interactiva",
      "Pizarra Blanca Magnética",
      "Biblioteca de Aula / Rincón Lector",
      "Mobiliario Infantil / Mesas Grupales",
      "Climatización Frío/Calor",
    ],
    estado: "Disponible",
    observaciones:
      "Aula adaptada especialmente para niveles iniciales (Playgroup, Initial 1-3) y primeros ciclos de Children, con mobiliario ergonómico.",
  },
  {
    id: "aula-2",
    codigo: "AULA-02",
    nombre: "Aula 2 (Laboratorio Multimedia)",
    ubicacion: "Planta Alta - Ala Tecnológica",
    capacidadMaxima: 18,
    horarioInicio: "09:00",
    horarioFin: "21:30",
    diasPermitidos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    instrumentosDidacticos: [
      "Proyector Full HD",
      "Notebooks / Equipos Multimedia",
      "Sistema de Audio Hi-Fi / Parlantes Bluetooth",
      "Pizarra Blanca Magnética",
      "Climatización Frío/Calor",
    ],
    estado: "Disponible",
    observaciones:
      "Equipada con estaciones de audio para práctica de Listening y exámenes internacionales Anglia/Cambridge, cursos de Juniors y Adults.",
  },
  {
    id: "aula-3",
    codigo: "AULA-03",
    nombre: "Aula 3 (Planta Alta Central)",
    ubicacion: "Planta Alta - Sector Central",
    capacidadMaxima: 18,
    horarioInicio: "09:00",
    horarioFin: "21:30",
    diasPermitidos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    instrumentosDidacticos: [
      "Smart TV 55\" / Pantalla Interactiva",
      "Biblioteca de Aula / Rincón Lector",
      "Pizarra Blanca Magnética",
      "Climatización Frío/Calor",
    ],
    estado: "Disponible",
    observaciones:
      "Espacio dinámico y luminoso para cursos de Juniors, Children intermedios y comisiones vespertinas de Adults.",
  },
  {
    id: "aula-4",
    codigo: "AULA-04",
    nombre: "Aula 4 (Avanzados & Exámenes)",
    ubicacion: "Planta Alta - Sector Oeste",
    capacidadMaxima: 20,
    horarioInicio: "09:00",
    horarioFin: "21:30",
    diasPermitidos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    instrumentosDidacticos: [
      "Smart TV 55\" / Pantalla Interactiva",
      "Proyector Full HD",
      "Sistema de Audio Hi-Fi / Parlantes Bluetooth",
      "Pizarra Blanca Magnética",
      "Climatización Frío/Calor",
    ],
    estado: "Disponible",
    observaciones:
      "Acondicionada para niveles superiores de Adults, cursos de Profesorado, talleres de Conversation y simulación de exámenes internacionales.",
  },
];
