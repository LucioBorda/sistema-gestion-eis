export interface PersonalAdminItem {
  id: string;
  dni: string;
  nombreCompleto: string;
  cargo: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  horarioAtencion: string;
  estado: "Activo" | "Licencia" | "Inactivo";
}
