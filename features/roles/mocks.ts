import { RoleItem } from "./types";

export const INITIAL_ROLES: RoleItem[] = [
  {
    id: "rol-1",
    codigo: "ROLE_DIRECTORA",
    nombre: "Directora General / Rectora",
    descripcion: "Supervisión directiva institucional, académica, tesorería, auditoría y administración de contenidos Landing.",
    usuariosAsignados: 1,
    totalPermisos: 26,
    esSistema: true,
    color: "coral",
    permisos: [
      "institucion.editar", "gestion.crear", "gestion.cerrar",
      "estudiantes.crear", "estudiantes.editar", "estudiantes.eliminar",
      "estudiantes.ver", "estudiantes.importar", "inscripciones.aprobar", "calificaciones.aprobar",
      "calificaciones.editar", "cuotas.cobrar", "cuotas.anular", "reportes.financieros",
      "landing.editar", "landing.publicar"
    ],
  },
  {
    id: "rol-2",
    codigo: "ROLE_ADMIN",
    nombre: "Administrador General / Manager",
    descripcion: "Control total del sistema: seguridad, roles de acceso, matriz de permisos, usuarios y toda la infraestructura institucional.",
    usuariosAsignados: 1,
    totalPermisos: 38,
    esSistema: true,
    color: "navy",
    permisos: [
      "institucion.editar", "gestion.crear", "gestion.cerrar", "roles.gestionar",
      "permisos.asignar", "usuarios.crear", "usuarios.editar", "usuarios.suspender",
      "usuarios.gestionar", "sistema.backups", "sistema.auditoria", "landing.editar",
      "estudiantes.crear", "estudiantes.editar", "estudiantes.eliminar", "estudiantes.ver",
      "cuotas.cobrar", "cuotas.anular", "calificaciones.aprobar", "reportes.financieros"
    ],
  },
  {
    id: "rol-3",
    codigo: "ROLE_SECRETARIA",
    nombre: "Secretaría Académica y Caja",
    descripcion: "Atención al público, matriculaciones, cobro de cuotas en ventanilla, emisión de recibos y legajos.",
    usuariosAsignados: 4,
    totalPermisos: 19,
    esSistema: true,
    color: "navy",
    permisos: [
      "estudiantes.crear", "estudiantes.editar", "estudiantes.ver", "inscripciones.crear",
      "cuotas.cobrar", "cuotas.ver", "recibos.emitir", "kardex.ver", "kardex.editar", "certificados.emitir"
    ],
  },
  {
    id: "rol-4",
    codigo: "ROLE_DOCENTE",
    nombre: "Personal Docente Titular",
    descripcion: "Carga de notas parciales y finales, registro de asistencia diaria y consulta de comisiones asignadas.",
    usuariosAsignados: 14,
    totalPermisos: 8,
    esSistema: true,
    color: "info",
    permisos: [
      "calificaciones.cargar", "calificaciones.ver", "asistencia.cargar", "comisiones.ver_propias", "kardex.ver_alumnos"
    ],
  },
  {
    id: "rol-5",
    codigo: "ROLE_ALUMNO",
    nombre: "Estudiante / Tutor Responsable",
    descripcion: "Portal de autogestión para consulta de calificaciones, estado de aranceles y certificaciones.",
    usuariosAsignados: 348,
    totalPermisos: 4,
    esSistema: true,
    color: "default",
    permisos: [
      "calificaciones.ver_propias", "cuotas.ver_propias", "kardex.ver_propio", "certificados.descargar"
    ],
  },
];
