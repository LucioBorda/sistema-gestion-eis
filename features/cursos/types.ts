export type CategoriaPrograma =
  | "Kinder / Inicial"
  | "Children"
  | "Juniors"
  | "Adults"
  | "Profesorado / Especial";

export type FranjaEtariaTest = "Children" | "Juniors" | "Adults";

export interface ComisionCurso {
  id: string;
  cursoId: string;
  codigo: string;
  turno: "Mañana" | "Tarde" | "Vespertino" | "Sábados";
  diasHorarios: string;
  aula: string;
  profesorTitular: string;
  cupoMaximo: number;
  cupoOcupado: number;
}

export interface CursoOficial {
  id: string;
  numeroOrden: number;
  nombre: string;
  categoria: CategoriaPrograma;
  cargaHorariaSemanal: number; // 2, 3 o 1.5
  cargaHorariaTexto: string; // ej: "2 hs semanales", "3 hs semanales", "1.5 hs semanales"
  franjaEtariaRecomendada: string;
  examenAngliaAsociado: string;
  librosMateriales: string[];
  descripcion: string;
  arancelEfectivoBase: number;
  arancelTransferenciaBase: number;
  comisiones: ComisionCurso[];
  activo: boolean;
}

export interface ArancelTramoFecha {
  tramo: "1 al 10" | "11 al 19" | "20 al fin de mes" | "Mes Vencido (+30d)";
  recargoPorcentaje: number;
  montoEfectivo: number;
  montoTransferencia: number;
}
