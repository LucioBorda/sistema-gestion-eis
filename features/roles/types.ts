export interface RoleItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  totalPermisos: number;
  esSistema: boolean;
  color: "coral" | "navy" | "info" | "default";
  permisos: string[];
}
