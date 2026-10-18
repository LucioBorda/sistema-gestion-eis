export type EstadoPago = "Pagado" | "Pendiente" | "Vencido";
export type MetodoCobro = "Efectivo" | "Transferencia" | "Tarjeta Débito" | "Tarjeta Crédito";

export type TramoFechaCobranza =
  | "tramo_1_10" // Días 1 al 10 (Base)
  | "tramo_11_19" // Días 11 al 19 (+10%)
  | "tramo_20_fin" // Días 20 al 30/31 (+20%)
  | "vencido_anterior"; // Meses anteriores adeudados (+30%)

export type EstadoCuentaAlumno = "Al Día" | "Cuota Mes Pendiente" | "Meses Adeudados (Mora)";

export interface CobranzaItem {
  id: string;
  reciboNumero: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteDni: string;
  legajoNumero: string;
  cursoNombre: string;
  concepto: string;
  mesPeriodo: string;
  montoBaseEfectivo: number;
  montoBaseTransferencia: number;
  montoBase: number;
  monto?: number;
  tramoFecha: TramoFechaCobranza;
  porcentajeRecargo: number;
  recargoMora: number;
  totalAPagar: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  metodoPago: MetodoCobro | null;
  cajeroResponsable: string | null;
  estado: EstadoPago;
  comprobanteReferencia: string | null;
  observaciones: string;
  montoRecibido?: number;
  vueltoEntregado?: number;
}

export interface MatrizArancelNivel {
  cursoNombre: string;
  efectivo: {
    dias1al10: number;
    dias11al19: number;
    dias20alFin: number;
    mesVencido: number;
  };
  transferencia: {
    dias1al10: number;
    dias11al19: number;
    dias20alFin: number;
    mesVencido: number;
  };
}

export interface CalculoTarifaActual {
  diaDelMes: number;
  tramo: TramoFechaCobranza;
  tramoNombre: string;
  porcentajeRecargo: number;
  esMoraMesesAnteriores: boolean;
  montoFinal: number;
}
