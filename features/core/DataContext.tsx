"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { InstitucionData } from "../institucion/types";
import { INITIAL_INSTITUCION_DATA } from "../institucion/mocks";
import { CicloLectivo } from "../gestion-educativa/types";
import { INITIAL_CICLOS_LECTIVOS } from "../gestion-educativa/mocks";
import { NivelTurno } from "../niveles-turnos/types";
import { INITIAL_NIVELES_TURNOS } from "../niveles-turnos/mocks";
import { Comision } from "../comisiones/types";
import { INITIAL_COMISIONES } from "../comisiones/mocks";
import { Aula } from "../aulas/types";
import { INITIAL_AULAS } from "../aulas/mocks";
import { Materia } from "../materias/types";
import { INITIAL_MATERIAS } from "../materias/mocks";
import { RoleItem } from "../roles/types";
import { INITIAL_ROLES } from "../roles/mocks";
import { PermisoItem } from "../permisos/types";
import { INITIAL_PERMISOS } from "../permisos/mocks";
import { UsuarioItem } from "../usuarios/types";
import { INITIAL_USUARIOS } from "../usuarios/mocks";
import { PersonalAdminItem } from "../personal-admin/types";
import { INITIAL_PERSONAL_ADMIN } from "../personal-admin/mocks";
import { PersonalDocenteItem } from "../personal-docente/types";
import { INITIAL_PERSONAL_DOCENTE } from "../personal-docente/mocks";
import { AsignacionMateriaItem } from "../asignacion-materias/types";
import { INITIAL_ASIGNACIONES } from "../asignacion-materias/mocks";
import { EstudianteItem } from "../estudiantes/types";
import { INITIAL_ESTUDIANTES } from "../estudiantes/mocks";
import { InscripcionItem } from "../inscripciones/types";
import { INITIAL_INSCRIPCIONES } from "../inscripciones/mocks";
import { KardexItem } from "../kardex/types";
import { INITIAL_KARDEX } from "../kardex/mocks";
import { CalificacionItem } from "../calificaciones/types";
import { INITIAL_CALIFICACIONES } from "../calificaciones/mocks";
import { CobranzaItem, MetodoCobro } from "../cobranzas/types";
import { INITIAL_COBRANZAS } from "../cobranzas/mocks";
import { LandingPhotoItem } from "../landing-cms/types";
import { INITIAL_LANDING_PHOTOS } from "../landing-cms/mocks";
import { CursoOficial } from "../cursos/types";
import { CURSOS_OFICIALES_EIS } from "../cursos/mocks";
import {
  PostulanteItem,
  ExamenDigitalizado,
  ResultadoCorreccion,
} from "../admisiones/types";
import { INITIAL_POSTULANTES } from "../admisiones/mocks";

interface DataContextType {
  institucion: InstitucionData;
  setInstitucion: React.Dispatch<React.SetStateAction<InstitucionData>>;
  ciclosLectivos: CicloLectivo[];
  addCiclo: (item: CicloLectivo) => void;
  updateCiclo: (item: CicloLectivo) => void;
  deleteCiclo: (id: string) => void;
  nivelesTurnos: NivelTurno[];
  addNivel: (item: NivelTurno) => void;
  updateNivel: (item: NivelTurno) => void;
  deleteNivel: (id: string) => void;
  comisiones: Comision[];
  addComision: (item: Comision) => void;
  updateComision: (item: Comision) => void;
  deleteComision: (id: string) => void;
  aulas: Aula[];
  addAula: (item: Aula) => void;
  updateAula: (item: Aula) => void;
  deleteAula: (id: string) => void;
  materias: Materia[];
  addMateria: (item: Materia) => void;
  updateMateria: (item: Materia) => void;
  deleteMateria: (id: string) => void;
  roles: RoleItem[];
  addRol: (item: RoleItem) => void;
  updateRol: (item: RoleItem) => void;
  deleteRol: (id: string) => void;
  permisos: PermisoItem[];
  addPermiso: (item: PermisoItem) => void;
  updatePermiso: (item: PermisoItem) => void;
  deletePermiso: (id: string) => void;
  usuarios: UsuarioItem[];
  addUsuario: (item: UsuarioItem) => void;
  updateUsuario: (item: UsuarioItem) => void;
  deleteUsuario: (id: string) => void;
  resetUsuarioPassword: (id: string) => void;
  personalAdmin: PersonalAdminItem[];
  addPersonalAdmin: (item: PersonalAdminItem) => void;
  updatePersonalAdmin: (item: PersonalAdminItem) => void;
  deletePersonalAdmin: (id: string) => void;
  personalDocente: PersonalDocenteItem[];
  addPersonalDocente: (item: PersonalDocenteItem) => void;
  updatePersonalDocente: (item: PersonalDocenteItem) => void;
  deletePersonalDocente: (id: string) => void;
  asignaciones: AsignacionMateriaItem[];
  addAsignacion: (item: AsignacionMateriaItem) => void;
  updateAsignacion: (item: AsignacionMateriaItem) => void;
  deleteAsignacion: (id: string) => void;
  estudiantes: EstudianteItem[];
  addEstudiante: (item: EstudianteItem) => void;
  updateEstudiante: (item: EstudianteItem) => void;
  deleteEstudiante: (id: string) => void;
  importEstudiantes: (items: EstudianteItem[]) => void;
  inscripciones: InscripcionItem[];
  addInscripcion: (item: InscripcionItem) => void;
  updateInscripcion: (item: InscripcionItem) => void;
  deleteInscripcion: (id: string) => void;
  kardexList: KardexItem[];
  updateKardex: (item: KardexItem) => void;
  calificaciones: CalificacionItem[];
  addCalificacion: (item: CalificacionItem) => void;
  updateCalificacion: (item: CalificacionItem) => void;
  deleteCalificacion: (id: string) => void;
  cobranzas: CobranzaItem[];
  addCobranza: (item: CobranzaItem) => void;
  registrarPago: (id: string, metodo: MetodoCobro, ref: string, cajero: string) => void;
  deleteCobranza: (id: string) => void;
  landingPhotos: LandingPhotoItem[];
  addLandingPhoto: (item: LandingPhotoItem) => void;
  updateLandingPhoto: (item: LandingPhotoItem) => void;
  togglePhotoActive: (id: string) => void;
  deleteLandingPhoto: (id: string) => void;
  reorderPhoto: (id: string, direction: "up" | "down") => void;
  cursos: CursoOficial[];
  postulantes: PostulanteItem[];
  addPostulante: (item: PostulanteItem) => void;
  updatePostulante: (item: PostulanteItem) => void;
  subirExamenFisico: (postulanteId: string, examen: ExamenDigitalizado) => void;
  corregirTestDirectora: (postulanteId: string, resultado: ResultadoCorreccion) => void;
  inscribirPreAlumno: (
    postulanteId: string,
    cursoId: string,
    comisionId: string,
    medioCobro: "Efectivo" | "Transferencia",
    montoMatricula: number
  ) => void;
  resetAllDataToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`eis_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`eis_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error("Error saving to localStorage", err);
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [institucion, setInstitucion] = useState<InstitucionData>(() =>
    loadFromStorage("institucion", INITIAL_INSTITUCION_DATA)
  );
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>(() =>
    loadFromStorage("ciclos", INITIAL_CICLOS_LECTIVOS)
  );
  const [nivelesTurnos, setNivelesTurnos] = useState<NivelTurno[]>(() =>
    loadFromStorage("niveles", INITIAL_NIVELES_TURNOS)
  );
  const [comisiones, setComisiones] = useState<Comision[]>(() => {
    const loaded = loadFromStorage<Comision[]>("comisiones", INITIAL_COMISIONES);
    if (!Array.isArray(loaded) || loaded.some((c) => c.aulaId === "aula-magna" || c.aulaId === "aula-5" || c.aulaId === "aula-kinder")) {
      return INITIAL_COMISIONES;
    }
    return loaded;
  });
  const [aulas, setAulas] = useState<Aula[]>(() => {
    const loaded = loadFromStorage<Aula[]>("aulas", INITIAL_AULAS);
    if (!Array.isArray(loaded) || loaded.length !== 4 || !loaded[0]?.horarioInicio) {
      return INITIAL_AULAS;
    }
    return loaded;
  });
  const [materias, setMaterias] = useState<Materia[]>(() =>
    loadFromStorage("materias", INITIAL_MATERIAS)
  );
  const [roles, setRoles] = useState<RoleItem[]>(() =>
    loadFromStorage("roles", INITIAL_ROLES)
  );
  const [permisos, setPermisos] = useState<PermisoItem[]>(() =>
    loadFromStorage("permisos", INITIAL_PERMISOS)
  );
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(() =>
    loadFromStorage("usuarios", INITIAL_USUARIOS)
  );
  const [personalAdmin, setPersonalAdmin] = useState<PersonalAdminItem[]>(() =>
    loadFromStorage("personal_admin", INITIAL_PERSONAL_ADMIN)
  );
  const [personalDocente, setPersonalDocente] = useState<PersonalDocenteItem[]>(() =>
    loadFromStorage("personal_docente", INITIAL_PERSONAL_DOCENTE)
  );
  const [asignaciones, setAsignaciones] = useState<AsignacionMateriaItem[]>(() =>
    loadFromStorage("asignaciones", INITIAL_ASIGNACIONES)
  );
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>(() =>
    loadFromStorage("estudiantes", INITIAL_ESTUDIANTES)
  );
  const [inscripciones, setInscripciones] = useState<InscripcionItem[]>(() =>
    loadFromStorage("inscripciones", INITIAL_INSCRIPCIONES)
  );
  const [kardexList, setKardexList] = useState<KardexItem[]>(() =>
    loadFromStorage("kardex", INITIAL_KARDEX)
  );
  const [calificaciones, setCalificaciones] = useState<CalificacionItem[]>(() =>
    loadFromStorage("calificaciones", INITIAL_CALIFICACIONES)
  );
  const [cobranzas, setCobranzas] = useState<CobranzaItem[]>(() =>
    loadFromStorage("cobranzas", INITIAL_COBRANZAS)
  );
  const [landingPhotos, setLandingPhotos] = useState<LandingPhotoItem[]>(() =>
    loadFromStorage("landing_photos", INITIAL_LANDING_PHOTOS)
  );
  const [cursos, setCursos] = useState<CursoOficial[]>(() =>
    loadFromStorage("cursos_19", CURSOS_OFICIALES_EIS)
  );
  const [postulantes, setPostulantes] = useState<PostulanteItem[]>(() =>
    loadFromStorage("postulantes", INITIAL_POSTULANTES)
  );

  // Sync state changes to storage
  useEffect(() => saveToStorage("institucion", institucion), [institucion]);
  useEffect(() => saveToStorage("ciclos", ciclosLectivos), [ciclosLectivos]);
  useEffect(() => saveToStorage("niveles", nivelesTurnos), [nivelesTurnos]);
  useEffect(() => saveToStorage("comisiones", comisiones), [comisiones]);
  useEffect(() => saveToStorage("aulas", aulas), [aulas]);
  useEffect(() => saveToStorage("materias", materias), [materias]);
  useEffect(() => saveToStorage("roles", roles), [roles]);
  useEffect(() => saveToStorage("permisos", permisos), [permisos]);
  useEffect(() => saveToStorage("usuarios", usuarios), [usuarios]);
  useEffect(() => saveToStorage("personal_admin", personalAdmin), [personalAdmin]);
  useEffect(() => saveToStorage("personal_docente", personalDocente), [personalDocente]);
  useEffect(() => saveToStorage("asignaciones", asignaciones), [asignaciones]);
  useEffect(() => saveToStorage("estudiantes", estudiantes), [estudiantes]);
  useEffect(() => saveToStorage("inscripciones", inscripciones), [inscripciones]);
  useEffect(() => saveToStorage("kardex", kardexList), [kardexList]);
  useEffect(() => saveToStorage("calificaciones", calificaciones), [calificaciones]);
  useEffect(() => saveToStorage("cobranzas", cobranzas), [cobranzas]);
  useEffect(() => saveToStorage("landing_photos", landingPhotos), [landingPhotos]);
  useEffect(() => saveToStorage("cursos_19", cursos), [cursos]);
  useEffect(() => saveToStorage("postulantes", postulantes), [postulantes]);

  // Ciclos
  const addCiclo = (item: CicloLectivo) => setCiclosLectivos((prev) => [item, ...prev]);
  const updateCiclo = (item: CicloLectivo) =>
    setCiclosLectivos((prev) => prev.map((c) => (c.id === item.id ? item : c)));
  const deleteCiclo = (id: string) =>
    setCiclosLectivos((prev) => prev.filter((c) => c.id !== id));

  // Niveles
  const addNivel = (item: NivelTurno) => setNivelesTurnos((prev) => [item, ...prev]);
  const updateNivel = (item: NivelTurno) =>
    setNivelesTurnos((prev) => prev.map((n) => (n.id === item.id ? item : n)));
  const deleteNivel = (id: string) =>
    setNivelesTurnos((prev) => prev.filter((n) => n.id !== id));

  // Comisiones
  const addComision = (item: Comision) => setComisiones((prev) => [item, ...prev]);
  const updateComision = (item: Comision) =>
    setComisiones((prev) => prev.map((c) => (c.id === item.id ? item : c)));
  const deleteComision = (id: string) =>
    setComisiones((prev) => prev.filter((c) => c.id !== id));

  // Aulas
  const addAula = (item: Aula) => setAulas((prev) => [item, ...prev]);
  const updateAula = (item: Aula) =>
    setAulas((prev) => prev.map((a) => (a.id === item.id ? item : a)));
  const deleteAula = (id: string) =>
    setAulas((prev) => prev.filter((a) => a.id !== id));

  // Materias
  const addMateria = (item: Materia) => setMaterias((prev) => [item, ...prev]);
  const updateMateria = (item: Materia) =>
    setMaterias((prev) => prev.map((m) => (m.id === item.id ? item : m)));
  const deleteMateria = (id: string) =>
    setMaterias((prev) => prev.filter((m) => m.id !== id));

  // Roles
  const addRol = (item: RoleItem) => setRoles((prev) => [item, ...prev]);
  const updateRol = (item: RoleItem) =>
    setRoles((prev) => prev.map((r) => (r.id === item.id ? item : r)));
  const deleteRol = (id: string) =>
    setRoles((prev) => prev.filter((r) => r.id !== id));

  // Permisos
  const addPermiso = (item: PermisoItem) => setPermisos((prev) => [item, ...prev]);
  const updatePermiso = (item: PermisoItem) =>
    setPermisos((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  const deletePermiso = (id: string) =>
    setPermisos((prev) => prev.filter((p) => p.id !== id));

  // Usuarios
  const addUsuario = (item: UsuarioItem) => setUsuarios((prev) => [item, ...prev]);
  const updateUsuario = (item: UsuarioItem) =>
    setUsuarios((prev) => prev.map((u) => (u.id === item.id ? item : u)));
  const deleteUsuario = (id: string) =>
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  const resetUsuarioPassword = (_id: string) => {
    alert("Se ha generado un enlace seguro de reseteo de clave y fue remitido al email institucional del usuario.");
  };

  // Personal Admin
  const addPersonalAdmin = (item: PersonalAdminItem) =>
    setPersonalAdmin((prev) => [item, ...prev]);
  const updatePersonalAdmin = (item: PersonalAdminItem) =>
    setPersonalAdmin((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  const deletePersonalAdmin = (id: string) =>
    setPersonalAdmin((prev) => prev.filter((p) => p.id !== id));

  // Personal Docente
  const addPersonalDocente = (item: PersonalDocenteItem) =>
    setPersonalDocente((prev) => [item, ...prev]);
  const updatePersonalDocente = (item: PersonalDocenteItem) =>
    setPersonalDocente((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  const deletePersonalDocente = (id: string) =>
    setPersonalDocente((prev) => prev.filter((p) => p.id !== id));

  // Asignaciones
  const addAsignacion = (item: AsignacionMateriaItem) =>
    setAsignaciones((prev) => [item, ...prev]);
  const updateAsignacion = (item: AsignacionMateriaItem) =>
    setAsignaciones((prev) => prev.map((a) => (a.id === item.id ? item : a)));
  const deleteAsignacion = (id: string) =>
    setAsignaciones((prev) => prev.filter((a) => a.id !== id));

  // Estudiantes
  const addEstudiante = (item: EstudianteItem) =>
    setEstudiantes((prev) => [item, ...prev]);
  const updateEstudiante = (item: EstudianteItem) =>
    setEstudiantes((prev) => prev.map((e) => (e.id === item.id ? item : e)));
  const deleteEstudiante = (id: string) =>
    setEstudiantes((prev) => prev.filter((e) => e.id !== id));
  const importEstudiantes = (items: EstudianteItem[]) => {
    setEstudiantes((prev) => [...items, ...prev]);
  };

  // Inscripciones
  const addInscripcion = (item: InscripcionItem) => {
    setInscripciones((prev) => [item, ...prev]);
    setComisiones((prev) =>
      prev.map((c) =>
        c.id === item.comisionId ? { ...c, cupoOcupado: c.cupoOcupado + 1 } : c
      )
    );
  };
  const updateInscripcion = (item: InscripcionItem) =>
    setInscripciones((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  const deleteInscripcion = (id: string) =>
    setInscripciones((prev) => prev.filter((i) => i.id !== id));

  // Kardex
  const updateKardex = (item: KardexItem) =>
    setKardexList((prev) => prev.map((k) => (k.id === item.id ? item : k)));

  // Calificaciones
  const addCalificacion = (item: CalificacionItem) =>
    setCalificaciones((prev) => [item, ...prev]);
  const updateCalificacion = (item: CalificacionItem) =>
    setCalificaciones((prev) => prev.map((c) => (c.id === item.id ? item : c)));
  const deleteCalificacion = (id: string) =>
    setCalificaciones((prev) => prev.filter((c) => c.id !== id));

  // Cobranzas
  const addCobranza = (item: CobranzaItem) =>
    setCobranzas((prev) => [item, ...prev]);
  const registrarPago = (
    id: string,
    metodo: MetodoCobro,
    ref: string,
    cajero: string
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    setCobranzas((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              estado: "Pagado",
              fechaPago: today,
              metodoPago: metodo,
              comprobanteReferencia: ref || `PAGO-REG-${id}`,
              cajeroResponsable: cajero,
            }
          : c
      )
    );
  };
  const deleteCobranza = (id: string) =>
    setCobranzas((prev) => prev.filter((c) => c.id !== id));

  // Landing Photos CMS
  const addLandingPhoto = (item: LandingPhotoItem) =>
    setLandingPhotos((prev) => [item, ...prev]);
  const updateLandingPhoto = (item: LandingPhotoItem) =>
    setLandingPhotos((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  const togglePhotoActive = (id: string) =>
    setLandingPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p))
    );
  const deleteLandingPhoto = (id: string) =>
    setLandingPhotos((prev) => prev.filter((p) => p.id !== id));
  const reorderPhoto = (id: string, direction: "up" | "down") => {
    setLandingPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Postulantes / Admisiones State Machine
  const addPostulante = (item: PostulanteItem) =>
    setPostulantes((prev) => [item, ...prev]);

  const updatePostulante = (item: PostulanteItem) =>
    setPostulantes((prev) => prev.map((p) => (p.id === item.id ? item : p)));

  const subirExamenFisico = (postulanteId: string, examen: ExamenDigitalizado) => {
    setPostulantes((prev) =>
      prev.map((p) =>
        p.id === postulanteId
          ? {
              ...p,
              estado: "Test en Corrección",
              examenDigitalizado: examen,
            }
          : p
      )
    );
  };

  const corregirTestDirectora = (
    postulanteId: string,
    resultado: ResultadoCorreccion
  ) => {
    setPostulantes((prev) =>
      prev.map((p) =>
        p.id === postulanteId
          ? {
              ...p,
              estado: "Pre-Alumno",
              resultadoCorreccion: resultado,
            }
          : p
      )
    );
  };

  const inscribirPreAlumno = (
    postulanteId: string,
    cursoId: string,
    comisionId: string,
    medioCobro: "Efectivo" | "Transferencia",
    montoMatricula: number
  ) => {
    const post = postulantes.find((p) => p.id === postulanteId);
    if (!post) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newLegajo = `LEG-2026-${String(estudiantes.length + 10).padStart(3, "0")}`;
    const cursoObj = cursos.find((c) => c.id === cursoId);
    const cursoNombre = cursoObj ? cursoObj.nombre : "General";

    // 1. Crear Estudiante Regular
    const nuevoEstudiante: EstudianteItem = {
      id: `est-${Date.now()}`,
      legajoNumero: newLegajo,
      dni: post.dni,
      nombreCompleto: post.nombreCompleto,
      fechaNacimiento: "2013-05-10",
      edad: post.edad,
      email: post.email,
      telefono: post.telefono,
      tutorResponsable: `${post.nombreCompleto} (Titular)`,
      tutorTelefono: post.telefono,
      tutorEmail: post.email,
      contactoEmergencia: post.telefono,
      cursoActual: `${cursoNombre} - Comisión Presencial`,
      comisionId: comisionId || "com-1",
      estado: "Regular",
      fechaInscripcion: todayStr,
      saldoPendiente: 0,
      convenioAngliaActivo: true,
    };
    setEstudiantes((prev) => [nuevoEstudiante, ...prev]);

    // 2. Transición del postulante a Alumno Activo
    setPostulantes((prev) =>
      prev.map((p) =>
        p.id === postulanteId
          ? {
              ...p,
              estado: "Alumno Activo",
              cursoInscritoId: cursoId,
              comisionInscritaId: comisionId,
            }
          : p
      )
    );

    // 3. Crear Registro Oficial de Matrícula (Inscripciones)
    const numeroMatricula = `MATR-2026-${String(inscripciones.length + 1).padStart(3, "0")}`;
    const comisionObj = comisiones.find((c) => c.id === comisionId);
    const nuevaInscripcion: InscripcionItem = {
      id: `ins-${Date.now()}`,
      numeroMatricula,
      estudianteId: nuevoEstudiante.id,
      estudianteNombre: post.nombreCompleto,
      estudianteDni: post.dni,
      comisionId: comisionId || "com-1",
      comisionNombre: comisionObj?.nombre || cursoNombre,
      cicloLectivo: "Ciclo Lectivo 2026",
      fechaMatriculacion: todayStr,
      arancelMatricula: montoMatricula,
      metodoPago: medioCobro,
      estado: "Confirmada",
      observaciones: `Matrícula formalizada tras Test Nivelatorio y pase a Alumno Activo.`,
    };
    setInscripciones((prev) => [nuevaInscripcion, ...prev]);

    // 4. Emitir y cobrar Matrícula en Cobranzas
    const reciboNumero = `REC-2026-${String(cobranzas.length + 500).padStart(5, "0")}`;
    const nuevaCobranza: CobranzaItem = {
      id: `cob-${Date.now()}`,
      reciboNumero,
      estudianteId: nuevoEstudiante.id,
      estudianteNombre: post.nombreCompleto,
      estudianteDni: post.dni,
      legajoNumero: newLegajo,
      cursoNombre,
      concepto: `Matrícula e Inscripción Ciclo 2026 (${cursoNombre})`,
      mesPeriodo: "Matrícula 2026",
      montoBaseEfectivo: montoMatricula,
      montoBaseTransferencia: Math.round(montoMatricula * 1.1),
      montoBase: montoMatricula,
      tramoFecha: "tramo_1_10",
      porcentajeRecargo: 0,
      recargoMora: 0,
      totalAPagar: montoMatricula,
      fechaVencimiento: todayStr,
      fechaPago: todayStr,
      metodoPago: medioCobro,
      cajeroResponsable: "Mariana Beltrán (Secretaría)",
      estado: "Pagado",
      comprobanteReferencia: `${medioCobro === "Efectivo" ? "CAJA-VENTANILLA" : "TRF-ONLINE"}-${Date.now().toString().slice(-4)}`,
      observaciones: `Matrícula confirmada tras Test Nivelatorio y pase a Alumno Activo.`,
    };
    setCobranzas((prev) => [nuevaCobranza, ...prev]);
  };

  const resetAllDataToDefaults = () => {
    if (confirm("¿Desea restaurar todos los datos a los valores semilla iniciales?")) {
      setInstitucion(INITIAL_INSTITUCION_DATA);
      setCiclosLectivos(INITIAL_CICLOS_LECTIVOS);
      setNivelesTurnos(INITIAL_NIVELES_TURNOS);
      setComisiones(INITIAL_COMISIONES);
      setAulas(INITIAL_AULAS);
      setMaterias(INITIAL_MATERIAS);
      setRoles(INITIAL_ROLES);
      setPermisos(INITIAL_PERMISOS);
      setUsuarios(INITIAL_USUARIOS);
      setPersonalAdmin(INITIAL_PERSONAL_ADMIN);
      setPersonalDocente(INITIAL_PERSONAL_DOCENTE);
      setAsignaciones(INITIAL_ASIGNACIONES);
      setEstudiantes(INITIAL_ESTUDIANTES);
      setInscripciones(INITIAL_INSCRIPCIONES);
      setKardexList(INITIAL_KARDEX);
      setCalificaciones(INITIAL_CALIFICACIONES);
      setCobranzas(INITIAL_COBRANZAS);
      setLandingPhotos(INITIAL_LANDING_PHOTOS);
      setCursos(CURSOS_OFICIALES_EIS);
      setPostulantes(INITIAL_POSTULANTES);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DataContext.Provider
      value={{
        institucion,
        setInstitucion,
        ciclosLectivos,
        addCiclo,
        updateCiclo,
        deleteCiclo,
        nivelesTurnos,
        addNivel,
        updateNivel,
        deleteNivel,
        comisiones,
        addComision,
        updateComision,
        deleteComision,
        aulas,
        addAula,
        updateAula,
        deleteAula,
        materias,
        addMateria,
        updateMateria,
        deleteMateria,
        roles,
        addRol,
        updateRol,
        deleteRol,
        permisos,
        addPermiso,
        updatePermiso,
        deletePermiso,
        usuarios,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        resetUsuarioPassword,
        personalAdmin,
        addPersonalAdmin,
        updatePersonalAdmin,
        deletePersonalAdmin,
        personalDocente,
        addPersonalDocente,
        updatePersonalDocente,
        deletePersonalDocente,
        asignaciones,
        addAsignacion,
        updateAsignacion,
        deleteAsignacion,
        estudiantes,
        addEstudiante,
        updateEstudiante,
        deleteEstudiante,
        importEstudiantes,
        inscripciones,
        addInscripcion,
        updateInscripcion,
        deleteInscripcion,
        kardexList,
        updateKardex,
        calificaciones,
        addCalificacion,
        updateCalificacion,
        deleteCalificacion,
        cobranzas,
        addCobranza,
        registrarPago,
        deleteCobranza,
        landingPhotos,
        addLandingPhoto,
        updateLandingPhoto,
        togglePhotoActive,
        deleteLandingPhoto,
        reorderPhoto,
        cursos,
        postulantes,
        addPostulante,
        updatePostulante,
        subirExamenFisico,
        corregirTestDirectora,
        inscribirPreAlumno,
        resetAllDataToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useGlobalData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within a DataProvider");
  }
  return context;
};
