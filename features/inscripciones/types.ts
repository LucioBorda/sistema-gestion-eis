export interface InscripcionItem {
  id: string;
  numeroMatricula: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteDni: string;
  comisionId: string;
  comisionNombre: string;
  cicloLectivo: string;
  fechaMatriculacion: string;
  arancelMatricula: number;
  metodoPago: "Efectivo" | "Transferencia" | "Tarjeta";
  estado: "Confirmada" | "Pendiente" | "Anulada";
  observaciones: string;
}
