export interface KardexCursoHistorial {
  anio: number;
  curso: string;
  comision: string;
  calificacionFinal: number;
  asistenciaPorcentaje: number;
  estado: "Aprobado" | "En Curso" | "Promocionado" | "Desaprobado";
  docenteACargo: string;
}

export interface CertificacionInternacional {
  id: string;
  tipo: "Anglia" | "UTN" | "EIS Oficial";
  tituloExamen: string;
  nivelMCER: string;
  anio: number;
  calificacionOtenida: string;
  folioNumero: string;
  distincionHonor: boolean;
}

export interface KardexItem {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  dni: string;
  legajoNumero: string;
  fechaIngresoInstitucional: string;
  porcentajeAsistenciaGlobal: number;
  promedioHistorico: number;
  historialCursos: KardexCursoHistorial[];
  certificaciones: CertificacionInternacional[];
  observacionesPedagogicas: string[];
}
