export interface EstudianteItem {
  id: string;
  legajoNumero: string;
  dni: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  email: string;
  telefono: string;
  tutorResponsable: string;
  tutorTelefono: string;
  tutorEmail: string;
  contactoEmergencia: string;
  cursoActual: string;
  comisionId: string;
  estado: "Regular" | "Inactivo" | "Egresado" | "Condicional";
  fechaInscripcion: string;
  saldoPendiente: number;
  convenioAngliaActivo: boolean;
}
