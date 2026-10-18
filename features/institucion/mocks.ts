import { InstitucionData } from "./types";

export const INITIAL_INSTITUCION_DATA: InstitucionData = {
  nombreComercial: "EIS Institute",
  razonSocial: "Cultural Inglesa de Ensenada Asociación Civil",
  cuit: "30-68421954-8",
  sedePrincipal: "Calle La Paz Nº 525, Ensenada, Provincia de Buenos Aires",
  telefono: "(0221) 469-5201",
  emailOficial: "contacto@culturalensenada.edu.ar",
  sitioWeb: "https://culturalensenada.edu.ar",
  directoraGeneral: "Lic. Prof. Patricia Valenzuela",
  resolucionMinisterial: "Res. DGCyE Nº 4812/98",
  convenios: [
    {
      nombre: "Anglia Examinations England",
      tipo: "Centro Oficial Examinador Internacional",
      codigoSede: "AR-ENS-084",
      descripcion: "Certificaciones internacionales de lengua inglesa homologadas por Chichester College y reconocidas en el marco MCER.",
      vigenteDesde: "2012",
    },
    {
      nombre: "Universidad Tecnológica Nacional (UTN - FRLP)",
      tipo: "Convenio de Articulación y Aval Académico",
      codigoSede: "UTN-EIS-2024",
      descripcion: "Cursos superiores, profesorados y certificación universitaria de competencias idiomáticas y metodológicas.",
      vigenteDesde: "2018",
    },
    {
      nombre: "Asociación de Institutos de Enseñanza Privada (AIEP)",
      tipo: "Afiliación Institucional",
      codigoSede: "AIEP-BA-912",
      descripcion: "Representación gremial docente y actualización pedagógica continua.",
      vigenteDesde: "2005",
    },
  ],
  redesSociales: {
    instagram: "@cultural.inglesa.ensenada",
    facebook: "CulturalInglesaEnsenada",
    whatsapp: "+54 9 221 469-5201",
  },
};
