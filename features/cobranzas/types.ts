export type EstadoPago = "Pagado" | "Pendiente" | "Vencido";
export type MetodoCobro = "Efectivo" | "Transferencia" | "Tarjeta Débito" | "Tarjeta Crédito";

export interface CobranzaItem {
  id: string;
  reciboNumero: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteDni: string;
  concepto: string;
  mesPeriodo: string;
  monto: number;
  recargoMora: number;
  totalAPagar: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  metodoPago: MetodoCobro | null;
  cajeroResponsable: string | null;
  estado: EstadoPago;
  comprobanteReferencia: string | null;
  observaciones: string;
}
