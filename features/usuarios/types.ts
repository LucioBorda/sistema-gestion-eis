export interface UsuarioItem {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  rolCodigo: string;
  estado: "Activo" | "Suspendido";
  ultimoAcceso: string;
  creadoEl: string;
  avatar: string;
  dosFactores: boolean;
}
