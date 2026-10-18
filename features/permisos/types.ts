export interface PermisoItem {
  id: string;
  codigo: string;
  modulo: string;
  descripcion: string;
  categoria: "Lectura" | "Escritura" | "Finanzas" | "Administración" | "CMS";
  nivelRiesgo: "Bajo" | "Medio" | "Alto";
}
