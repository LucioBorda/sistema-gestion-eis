export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  nivelId: string;
  nivelNombre: string;
  cargaHorariaSemanal: number;
  tipo: "Troncal" | "Taller" | "Práctica Pedagógica" | "Optativa";
  regimen: "Anual" | "Cuatrimestral";
  activo: boolean;
  descripcion: string;
}
