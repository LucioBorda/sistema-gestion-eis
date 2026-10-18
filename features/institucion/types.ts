export interface InstitucionData {
  nombreComercial: string;
  razonSocial: string;
  cuit: string;
  sedePrincipal: string;
  telefono: string;
  emailOficial: string;
  sitioWeb: string;
  directoraGeneral: string;
  resolucionMinisterial: string;
  convenios: {
    nombre: string;
    tipo: string;
    codigoSede: string;
    descripcion: string;
    vigenteDesde: string;
  }[];
  redesSociales: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}
