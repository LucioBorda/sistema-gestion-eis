export interface PersonalDocenteItem {
  id: string;
  dni: string;
  nombreCompleto: string;
  titulacion: string;
  email: string;
  telefono: string;
  materiasHabilitadas: string[];
  disponibilidadHoraria: string;
  totalComisionesAsignadas: number;
  estado: "Activo" | "Licencia" | "Inactivo";
  antiguedadAnios: number;
}
