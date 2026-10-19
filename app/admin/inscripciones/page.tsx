"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { InscripcionItem } from "@/features/inscripciones/types";
import { CobranzaItem } from "@/features/cobranzas/types";
import { PostulanteItem } from "@/features/admisiones/types";
import { CalculadoraVuelto } from "@/features/cobranzas/components/CalculadoraVuelto";
import { ReciboNoFiscalModal } from "@/features/cobranzas/components/ReciboNoFiscalModal";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  GraduationCap,
  UserCheck,
  Banknote,
  CreditCard,
  Sparkles,
  Info,
  User,
  Receipt,
  Wallet,
} from "lucide-react";

// Escala de Aranceles de Matrícula por Mes fijada por la Administración Escolar
const ESCALA_MESES_MATRICULA = [
  { value: "septiembre", label: "Septiembre (Matrícula Temprana) — $30.000", monto: 30000 },
  { value: "octubre", label: "Octubre (Matrícula Regular) — $35.000", monto: 35000 },
  { value: "noviembre", label: "Noviembre (Matrícula Escalonada) — $38.000", monto: 38000 },
  { value: "diciembre", label: "Diciembre (Cierre de Año) — $40.000", monto: 40000 },
  { value: "febrero", label: "Febrero / Marzo (Inicio de Ciclo) — $45.000", monto: 45000 },
  { value: "personalizado", label: "Arancel Personalizado (Fijado por Administración)", monto: 0 },
];

function InscripcionesContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postulanteIdParam = searchParams.get("postulanteId");
  const actionParam = searchParams.get("action");
  const inscripcionIdParam = searchParams.get("inscripcionId");

  const { currentUser } = useAuth();
  const {
    inscripciones,
    estudiantes,
    comisiones,
    ciclosLectivos,
    postulantes,
    cursos,
    cobranzas,
    addInscripcion,
    updateInscripcion,
    deleteInscripcion,
    inscribirPreAlumno,
    addCobranza,
    updateEstudiante,
  } = useGlobalData();

  // Dialogs & Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const [selectedIns, setSelectedIns] = useState<InscripcionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State: Regular Matriculación
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [comisionId, setComisionId] = useState(comisiones[0]?.id || "");
  const [cicloLectivo, setCicloLectivo] = useState("Ciclo Lectivo 2026");
  const [mesPagoSeleccionado, setMesPagoSeleccionado] = useState("octubre");
  const [arancelMatricula, setArancelMatricula] = useState(35000);
  const [metodoPago, setMetodoPago] = useState<InscripcionItem["metodoPago"]>("Transferencia");
  const [estado, setEstado] = useState<InscripcionItem["estado"]>("Confirmada");
  const [observaciones, setObservaciones] = useState("");

  // Postulante Matriculación Form State & Ventanilla Desk
  const targetPostulante = postulanteIdParam
    ? postulantes.find((p) => p.id === postulanteIdParam) || null
    : null;

  const [selectedPostulanteParaMatricula, setSelectedPostulanteParaMatricula] =
    useState<PostulanteItem | null>(targetPostulante);
  const [selectedInscripcionParaAcreditar, setSelectedInscripcionParaAcreditar] =
    useState<InscripcionItem | null>(null);
  const [postComisionId, setPostComisionId] = useState(comisiones[0]?.id || "");
  const [postMesPago, setPostMesPago] = useState("octubre");
  const [postArancel, setPostArancel] = useState(35000);
  const [postMetodoPago, setPostMetodoPago] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [montoRecibidoMatricula, setMontoRecibidoMatricula] = useState<number>(0);
  const [comprobanteRefMatricula, setComprobanteRefMatricula] = useState<string>("");
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [lastCobranzaEmitida, setLastCobranzaEmitida] = useState<CobranzaItem | null>(null);

  // Pre-alumnos list (aspirantes con test aprobado listos para matricular)
  const preAlumnos = React.useMemo(() => {
    return postulantes.filter((p) => p.estado === "Pre-Alumno");
  }, [postulantes]);

  // Alumnos con matrícula 2026 pendiente de cobro (acreditación de deuda)
  const inscripcionesPendientes = React.useMemo(() => {
    return inscripciones.filter((i) => i.estado === "Pendiente");
  }, [inscripciones]);

  // Handler to select an applicant for matriculation
  const handleSelectPostulante = (post: PostulanteItem) => {
    setSelectedPostulanteParaMatricula(post);
    setSelectedInscripcionParaAcreditar(null);

    // Auto-match commission based on assigned level
    const assignedLevel = post.resultadoCorreccion?.nivelAsignado || "";
    const matchingComision = comisiones.find((c) =>
      c.nombre.toLowerCase().includes(assignedLevel.toLowerCase().slice(0, 6))
    );
    if (matchingComision) {
      setPostComisionId(matchingComision.id);
    } else if (comisiones[0]) {
      setPostComisionId(comisiones[0].id);
    }

    setPostMesPago("octubre");
    setPostArancel(35000);
    setPostMetodoPago("Efectivo");
    setMontoRecibidoMatricula(0);
    setComprobanteRefMatricula(`CAJA-MATR-${Date.now().toString().slice(-4)}`);
  };

  // Handler to select an existing student with pending matricula to acredite debt
  const handleSeleccionarParaAcreditar = (ins: InscripcionItem) => {
    setSelectedInscripcionParaAcreditar(ins);
    setSelectedPostulanteParaMatricula(null);
    setPostComisionId(ins.comisionId || comisiones[0]?.id || "");
    setPostMesPago("octubre");
    setPostArancel(ins.arancelMatricula || 35000);
    setPostMetodoPago(ins.metodoPago === "Tarjeta" ? "Transferencia" : ins.metodoPago);
    setMontoRecibidoMatricula(0);
    setComprobanteRefMatricula(`CAJA-MATR-${Date.now().toString().slice(-4)}`);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auto-open Ventanilla Desk if navigating to matricular or acredite
  useEffect(() => {
    if (actionParam === "matricular" && targetPostulante) {
      handleSelectPostulante(targetPostulante);
    } else if (actionParam === "acreditar" && inscripcionIdParam) {
      const foundIns = inscripciones.find((i) => i.id === inscripcionIdParam);
      if (foundIns) {
        handleSeleccionarParaAcreditar(foundIns);
      }
    } else if (!postulanteIdParam && !inscripcionIdParam) {
      setSelectedPostulanteParaMatricula(null);
      setSelectedInscripcionParaAcreditar(null);
    }
  }, [actionParam, targetPostulante?.id, postulanteIdParam, inscripcionIdParam, inscripciones]);

  const estudianteAcreditarObj = selectedInscripcionParaAcreditar
    ? estudiantes.find(
        (e) => e.id === selectedInscripcionParaAcreditar.estudianteId
      )
    : null;

  // Handle month selection change for regular form
  const handleMesChange = (mesVal: string) => {
    setMesPagoSeleccionado(mesVal);
    const escala = ESCALA_MESES_MATRICULA.find((e) => e.value === mesVal);
    if (escala && escala.monto > 0) {
      setArancelMatricula(escala.monto);
    }
  };

  // Handle month selection change for postulante form
  const handlePostMesChange = (mesVal: string) => {
    setPostMesPago(mesVal);
    const escala = ESCALA_MESES_MATRICULA.find((e) => e.value === mesVal);
    if (escala && escala.monto > 0) {
      setPostArancel(escala.monto);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedIns(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setComisionId(comisiones[0]?.id || "");
    setCicloLectivo("Ciclo Lectivo 2026");
    setMesPagoSeleccionado("octubre");
    setArancelMatricula(35000);
    setMetodoPago("Transferencia");
    setEstado("Confirmada");
    setObservaciones("Matrícula anual regular asentada en secretaría.");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InscripcionItem) => {
    setIsEditing(true);
    setSelectedIns(item);
    setEstudianteId(item.estudianteId);
    setComisionId(item.comisionId);
    setCicloLectivo(item.cicloLectivo);
    setMesPagoSeleccionado("personalizado");
    setArancelMatricula(item.arancelMatricula);
    setMetodoPago(item.metodoPago);
    setEstado(item.estado);
    setObservaciones(item.observaciones);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: InscripcionItem) => {
    setSelectedIns(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: InscripcionItem) => {
    setSelectedIns(item);
    setConfirmDeleteOpen(true);
  };

  const selectedComisionObj = comisiones.find((c) => c.id === comisionId);
  const isCupoFull = selectedComisionObj
    ? selectedComisionObj.cupoOcupado >= selectedComisionObj.cupoMaximo
    : false;

  const postSelectedComisionObj = comisiones.find((c) => c.id === postComisionId);

  // Save Regular Matriculación
  const handleSaveRegular = (e: React.FormEvent) => {
    e.preventDefault();
    const estObj = estudiantes.find((e) => e.id === estudianteId);
    const comObj = comisiones.find((c) => c.id === comisionId);

    const estudianteNombre = estObj ? estObj.nombreCompleto : "Alumno";
    const estudianteDni = estObj ? estObj.dni : "00000000";
    const comisionNombre = comObj ? comObj.nombre : "Comisión";

    if (isEditing && selectedIns) {
      updateInscripcion({
        ...selectedIns,
        estudianteId,
        estudianteNombre,
        estudianteDni,
        comisionId,
        comisionNombre,
        cicloLectivo,
        arancelMatricula,
        metodoPago,
        estado,
        observaciones,
      });
    } else {
      const numeroMatricula = `MATR-2026-${String(inscripciones.length + 1).padStart(3, "0")}`;
      const newIns: InscripcionItem = {
        id: `ins-${Date.now()}`,
        numeroMatricula,
        estudianteId,
        estudianteNombre,
        estudianteDni,
        comisionId,
        comisionNombre,
        cicloLectivo,
        fechaMatriculacion: new Date().toISOString().slice(0, 10),
        arancelMatricula,
        metodoPago,
        estado,
        observaciones,
      };
      addInscripcion(newIns);
    }
    setModalOpen(false);
    setSuccessNotification(`Matrícula asentada exitosamente con valor de ${formatCurrency(arancelMatricula)}.`);
  };

  // Confirmar Matriculación y Emisión de Cobro en Mostrador (Idéntico a Operatoria de Ventanilla)
  const handleConfirmarCobroMatricula = (e: React.FormEvent) => {
    e.preventDefault();
    const postulante = selectedPostulanteParaMatricula || targetPostulante;
    if (!postulante) return;

    if (postMetodoPago === "Transferencia" && !comprobanteRefMatricula.trim()) {
      alert("Por favor ingrese el número de comprobante o referencia bancaria.");
      return;
    }

    if (
      postMetodoPago === "Efectivo" &&
      montoRecibidoMatricula > 0 &&
      montoRecibidoMatricula < postArancel
    ) {
      alert("El monto recibido en efectivo es menor al arancel de matrícula a cobrar.");
      return;
    }

    const matchedCurso = cursos[0]?.id || "cur-1";
    const todayStr = new Date().toISOString().slice(0, 10);
    const reciboNumero = `REC-2026-${String(cobranzas.length + 500).padStart(5, "0")}`;
    const vuelto =
      postMetodoPago === "Efectivo"
        ? Math.max(0, montoRecibidoMatricula - postArancel)
        : 0;
    const comisionObj = comisiones.find((c) => c.id === postComisionId);
    const cajeroStr = `${currentUser.name} (${currentUser.role})`;

    // 1. Asentar matriculación en DataContext (Estudiantes, Inscripciones y Cobranzas)
    inscribirPreAlumno(
      postulante.id,
      matchedCurso,
      postComisionId,
      postMetodoPago,
      postArancel
    );

    // 2. Generar objeto de cobranza formal para la previsualización del Recibo No Fiscal
    const cobranzaEmitida: CobranzaItem = {
      id: `cob-${Date.now()}`,
      reciboNumero,
      estudianteId: postulante.id,
      estudianteNombre: postulante.nombreCompleto,
      estudianteDni: postulante.dni,
      legajoNumero: `LEG-2026-${String(estudiantes.length + 10).padStart(3, "0")}`,
      cursoNombre: comisionObj?.nombre || "Comisión Presencial",
      concepto: `Matrícula Ciclo Lectivo 2026 (${comisionObj?.nombre || "General"})`,
      mesPeriodo: `Matrícula ${postMesPago.charAt(0).toUpperCase() + postMesPago.slice(1)} 2026`,
      montoBaseEfectivo: postArancel,
      montoBaseTransferencia: Math.round(postArancel * 1.1),
      montoBase: postArancel,
      tramoFecha: "tramo_1_10",
      porcentajeRecargo: 0,
      recargoMora: 0,
      totalAPagar: postArancel,
      fechaVencimiento: todayStr,
      fechaPago: todayStr,
      metodoPago: postMetodoPago,
      cajeroResponsable: cajeroStr,
      estado: "Pagado",
      comprobanteReferencia:
        comprobanteRefMatricula ||
        `${postMetodoPago === "Efectivo" ? "CAJA-MATR" : "TRF-ONLINE"}-${Date.now().toString().slice(-4)}`,
      observaciones: `Matrícula formalizada en ventanilla tras test nivelatorio aprobado. Tarifa fijada según mes de ${postMesPago}. Sin mora.`,
      montoRecibido:
        postMetodoPago === "Efectivo"
          ? montoRecibidoMatricula || postArancel
          : postArancel,
      vueltoEntregado: vuelto,
    };

    setLastCobranzaEmitida(cobranzaEmitida);
    setReciboModalOpen(true);
    setSelectedPostulanteParaMatricula(null);
    setSuccessNotification(
      `¡Matrícula confirmada con éxito! ${postulante.nombreCompleto} ha sido incorporado al padrón oficial de alumnos regulares en ${comisionObj?.nombre || "su comisión"}. Recibo emitido.`
    );

    router.replace("/admin/inscripciones");
  };

  // Acreditar Deuda de Matrícula para Alumnos de Años Anteriores
  const handleConfirmarAcreditacionDeuda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInscripcionParaAcreditar) return;

    if (postMetodoPago === "Transferencia" && !comprobanteRefMatricula.trim()) {
      alert("Por favor ingrese el número de comprobante o referencia bancaria.");
      return;
    }

    if (
      postMetodoPago === "Efectivo" &&
      montoRecibidoMatricula > 0 &&
      montoRecibidoMatricula < postArancel
    ) {
      alert("El monto recibido en efectivo es menor al arancel de matrícula a cobrar.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const reciboNumero = `REC-2026-${String(cobranzas.length + 500).padStart(5, "0")}`;
    const vuelto =
      postMetodoPago === "Efectivo"
        ? Math.max(0, montoRecibidoMatricula - postArancel)
        : 0;
    const comisionObj = comisiones.find((c) => c.id === postComisionId);
    const cajeroStr = `${currentUser.name} (${currentUser.role})`;
    const estObj = estudiantes.find(
      (e) => e.id === selectedInscripcionParaAcreditar.estudianteId
    );

    // 1. Actualizar la Inscripción a estado Confirmada
    const inscripcionActualizada: InscripcionItem = {
      ...selectedInscripcionParaAcreditar,
      estado: "Confirmada",
      comisionId: postComisionId,
      comisionNombre: comisionObj?.nombre || selectedInscripcionParaAcreditar.comisionNombre,
      arancelMatricula: postArancel,
      metodoPago: postMetodoPago,
      fechaMatriculacion: todayStr,
      observaciones: `Deuda de matrícula acreditada en secretaría el ${todayStr} vía ${postMetodoPago}. Sin mora.`,
    };
    updateInscripcion(inscripcionActualizada);

    // 2. Si el alumno tenía saldo pendiente en su legajo, descontar el arancel abonado
    if (estObj) {
      updateEstudiante({
        ...estObj,
        saldoPendiente: Math.max(0, estObj.saldoPendiente - postArancel),
        estado: estObj.estado === "Condicional" ? "Regular" : estObj.estado,
      });
    }

    // 3. Emitir el registro oficial de Cobranza para el Recibo No Fiscal
    const cobranzaEmitida: CobranzaItem = {
      id: `cob-${Date.now()}`,
      reciboNumero,
      estudianteId: selectedInscripcionParaAcreditar.estudianteId,
      estudianteNombre: selectedInscripcionParaAcreditar.estudianteNombre,
      estudianteDni: selectedInscripcionParaAcreditar.estudianteDni,
      legajoNumero: estObj?.legajoNumero || "LEG-REGULAR",
      cursoNombre: comisionObj?.nombre || selectedInscripcionParaAcreditar.comisionNombre,
      concepto: `Matrícula Ciclo Lectivo 2026 (Acreditación de Deuda)`,
      mesPeriodo: `Matrícula ${postMesPago.charAt(0).toUpperCase() + postMesPago.slice(1)} 2026`,
      montoBaseEfectivo: postArancel,
      montoBaseTransferencia: Math.round(postArancel * 1.1),
      montoBase: postArancel,
      tramoFecha: "tramo_1_10",
      porcentajeRecargo: 0,
      recargoMora: 0,
      totalAPagar: postArancel,
      fechaVencimiento: todayStr,
      fechaPago: todayStr,
      metodoPago: postMetodoPago,
      cajeroResponsable: cajeroStr,
      estado: "Pagado",
      comprobanteReferencia:
        comprobanteRefMatricula ||
        `${postMetodoPago === "Efectivo" ? "CAJA-MATR" : "TRF-ONLINE"}-${Date.now().toString().slice(-4)}`,
      observaciones: `Acreditación de deuda de matrícula del año concurrente 2026. Alumno regular de años anteriores.`,
      montoRecibido:
        postMetodoPago === "Efectivo"
          ? montoRecibidoMatricula || postArancel
          : postArancel,
      vueltoEntregado: vuelto,
    };
    addCobranza(cobranzaEmitida);

    setLastCobranzaEmitida(cobranzaEmitida);
    setReciboModalOpen(true);
    setSelectedInscripcionParaAcreditar(null);
    setSuccessNotification(
      `¡Deuda de matrícula acreditada con éxito! La matrícula de ${selectedInscripcionParaAcreditar.estudianteNombre} ha sido Confirmada y se emitió el recibo correspondiente.`
    );

    router.replace("/admin/inscripciones");
  };

  const handleConfirmDelete = () => {
    if (selectedIns) {
      deleteInscripcion(selectedIns.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "matriculas_inscripciones_eis",
      [
        { header: "Matrícula Nº", accessor: "numeroMatricula" },
        { header: "Estudiante", accessor: "estudianteNombre" },
        { header: "DNI", accessor: "estudianteDni" },
        { header: "Comisión Asignada", accessor: "comisionNombre" },
        { header: "Ciclo Lectivo", accessor: "cicloLectivo" },
        { header: "Fecha", accessor: (i) => formatDate(i.fechaMatriculacion) },
        { header: "Arancel Matrícula", accessor: (i) => formatCurrency(i.arancelMatricula) },
        { header: "Método de Pago", accessor: "metodoPago" },
        { header: "Estado", accessor: "estado" },
      ],
      inscripciones
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Libro de Matrículas e Inscripciones Oficiales - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Estudiante</th>
            <th>DNI</th>
            <th>Comisión</th>
            <th>Fecha</th>
            <th>Arancel</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${inscripciones
            .map(
              (i) => `
            <tr>
              <td><strong>${i.numeroMatricula}</strong></td>
              <td>${i.estudianteNombre}</td>
              <td>${i.estudianteDni}</td>
              <td>${i.comisionNombre}</td>
              <td>${formatDate(i.fechaMatriculacion)}</td>
              <td>${formatCurrency(i.arancelMatricula)} (${i.metodoPago})</td>
              <td>${i.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Libro de Matrículas Institucionales", htmlBody);
  };

  const columns: ColumnDef<InscripcionItem>[] = [
    {
      id: "matricula",
      header: "Nº Matrícula",
      accessorKey: "numeroMatricula",
      sortable: true,
      className: "w-32 font-bold text-[#00205B]",
    },
    {
      id: "estudiante",
      header: "Estudiante",
      accessorKey: "estudianteNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.estudianteNombre}</span>
          <span className="text-[11px] font-mono text-slate-500">DNI {item.estudianteDni}</span>
        </div>
      ),
    },
    {
      id: "comision",
      header: "Comisión / Ciclo",
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            {item.comisionNombre}
          </span>
          <span className="text-[11px] text-slate-400">{item.cicloLectivo}</span>
        </div>
      ),
    },
    {
      id: "arancel",
      header: "Arancel Matrícula",
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {formatCurrency(item.arancelMatricula)}
          </span>
          <span className="text-[11px] text-slate-500">{item.metodoPago}</span>
        </div>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: (item) => (
        <span className="text-xs text-slate-600">{formatDate(item.fechaMatriculacion)}</span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              item.estado === "Confirmada"
                ? "success"
                : item.estado === "Pendiente"
                ? "warning"
                : "danger"
            }
            size="sm"
          >
            {item.estado}
          </Badge>
          {item.estado === "Pendiente" && (
            <Button
              size="sm"
              variant="coral"
              onClick={() => handleSeleccionarParaAcreditar(item)}
              className="font-bold whitespace-nowrap shadow-xs text-[11px]"
              icon={<Receipt className="w-3.5 h-3.5" />}
            >
              Acreditar Pago
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline ml-4"
          >
            Entendido
          </button>
        </div>
      )}

      {/* VENTANILLA DE MATRICULACIÓN Y COBRO EN SECRETARÍA (FORMATO EXACTO SEGUNDA IMAGEN) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Header Membrete (Idéntico a foto 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Operatoria Diaria de Ventanilla
            </div>
            <h2 className="text-lg font-black text-[#00205B] tracking-tight">
              Ventanilla de Cobro Rápido en Secretaría
            </h2>
            <p className="text-xs text-slate-500">
              Matriculación directa de aspirantes y acreditación de deuda de matrícula para alumnos regulares de años anteriores
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Día de Facturación Actual
            </span>
            <span className="text-sm font-black text-slate-800">
              Día 19 del mes
            </span>
            <span className="text-[11px] text-[#00205B] font-semibold block">
              Ciclo Lectivo 2026 · Sin mora
            </span>
          </div>
        </div>

        {/* Si no hay aspirante ni alumno seleccionado, mostramos un selector limpio sin menús flotantes trabados */}
        {!selectedPostulanteParaMatricula && !selectedInscripcionParaAcreditar ? (
          <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-[#00205B] flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Seleccione un Alumno o Aspirante para Cobrar o Acreditar su Matrícula
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alumnos regulares con matrícula pendiente ({inscripcionesPendientes.length}) y aspirantes nuevos habilitados ({preAlumnos.length})
              </p>
            </div>

            {inscripcionesPendientes.length > 0 && (
              <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Hay <strong>{inscripcionesPendientes.length} matrícula(s) 2026 pendiente(s) de pago</strong>.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="coral"
                  onClick={() => handleSeleccionarParaAcreditar(inscripcionesPendientes[0])}
                  className="font-bold shrink-0 ml-2 shadow-xs"
                >
                  Acreditar {inscripcionesPendientes[0].estudianteNombre.split(" ")[0]}
                </Button>
              </div>
            )}

            <div className="max-w-xl mx-auto">
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("post:")) {
                    const pId = val.replace("post:", "");
                    const found = preAlumnos.find((p) => p.id === pId);
                    if (found) handleSelectPostulante(found);
                  } else if (val.startsWith("ins:")) {
                    const insId = val.replace("ins:", "");
                    const found = inscripciones.find((i) => i.id === insId);
                    if (found) handleSeleccionarParaAcreditar(found);
                  }
                }}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00205B] shadow-2xs text-slate-800 cursor-pointer"
              >
                <option value="">
                  -- Seleccionar de la lista de cobranza en ventanilla --
                </option>

                {inscripcionesPendientes.length > 0 && (
                  <optgroup label="⚠️ Alumnos de Años Anteriores · Matrícula 2026 Pendiente de Pago">
                    {inscripcionesPendientes.map((ins) => (
                      <option key={ins.id} value={`ins:${ins.id}`}>
                        {ins.estudianteNombre} (DNI {ins.estudianteDni}) · Matrícula: {ins.numeroMatricula} · {ins.comisionNombre} · Deuda: {formatCurrency(ins.arancelMatricula)}
                      </option>
                    ))}
                  </optgroup>
                )}

                <optgroup label={`🎓 Aspirantes Nuevos · Test Nivelatorio Aprobado (${preAlumnos.length})`}>
                  {preAlumnos.map((p) => (
                    <option key={p.id} value={`post:${p.id}`}>
                      {p.nombreCompleto} · DNI {p.dni} · Nivel: {p.resultadoCorreccion?.nivelAsignado || "General"} · {p.franjaEtaria}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <p className="text-[11px] text-slate-400">
              Tip: También puede presionar el botón <strong>"Acreditar Pago"</strong> directamente en la fila del alumno en el libro de matrículas inferior.
            </p>
          </div>
        ) : (
          /* Panel del Alumno Seleccionado en Ventanilla (Idéntico a foto image.png) */
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-5 animate-in fade-in duration-200">
            {/* Header del Alumno / Aspirante */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {selectedInscripcionParaAcreditar
                      ? selectedInscripcionParaAcreditar.estudianteNombre
                      : selectedPostulanteParaMatricula?.nombreCompleto}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedInscripcionParaAcreditar ? (
                      <>
                        DNI {selectedInscripcionParaAcreditar.estudianteDni} · Legajo: {estudianteAcreditarObj?.legajoNumero || "LEG-REGULAR"} · {selectedInscripcionParaAcreditar.comisionNombre} · Matrícula {selectedInscripcionParaAcreditar.numeroMatricula}
                      </>
                    ) : (
                      <>
                        DNI {selectedPostulanteParaMatricula?.dni} · Postulante Aprobado · {postSelectedComisionObj?.nombre || "Comisión a asignar"} · Nivel: {selectedPostulanteParaMatricula?.resultadoCorreccion?.nivelAsignado || "General"}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {selectedInscripcionParaAcreditar
                      ? "Estado: Matrícula 2026 Pendiente de Pago"
                      : "Estado: Matrícula Inicial Pendiente"}
                  </span>
                </div>
                {selectedInscripcionParaAcreditar && (
                  <Badge variant="navy" size="sm">
                    Alumno de Años Anteriores
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPostulanteParaMatricula(null);
                    setSelectedInscripcionParaAcreditar(null);
                    router.replace("/admin/inscripciones");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Cambiar
                </Button>
              </div>
            </div>

            {/* Formulario de Matrícula y Cobro */}
            <form
              onSubmit={
                selectedInscripcionParaAcreditar
                  ? handleConfirmarAcreditacionDeuda
                  : handleConfirmarCobroMatricula
              }
              className="space-y-4"
            >
                  {/* Asignación de Comisión y Mes de Matrícula */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Comisión y Turno Asignado:
                      </label>
                      <select
                        value={postComisionId}
                        onChange={(e) => setPostComisionId(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                      >
                        {comisiones.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.cupoOcupado}/{c.cupoMaximo} cupos) - {c.diasHorarios}
                          </option>
                        ))}
                      </select>
                      {postSelectedComisionObj && (
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                          ✓ {postSelectedComisionObj.cupoMaximo - postSelectedComisionObj.cupoOcupado} vacantes disponibles en esta comisión
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mes de Pago (Tarifa Fijada por la Administración - Sin Mora):
                      </label>
                      <select
                        value={postMesPago}
                        onChange={(e) => handlePostMesChange(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00205B]"
                      >
                        {ESCALA_MESES_MATRICULA.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        El valor de matrícula no devenga mora. Se aplica la tarifa según mes.
                      </span>
                    </div>
                  </div>

                  {/* Liquidación en Tiempo Real: 3 Cajas (Idéntico a foto image.png) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        CONCEPTO A COBRAR
                      </span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">
                        Matrícula Ciclo Lectivo 2026
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {selectedInscripcionParaAcreditar
                          ? `Acreditación de Deuda Pendiente (${selectedInscripcionParaAcreditar.numeroMatricula})`
                          : "Alta de Matrícula Oficial Inicial"}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        TRAMO APLICADO SEGÚN FECHA
                      </span>
                      <span className="text-xs font-bold text-[#00205B] block mt-1">
                        Matrícula Mes de {postMesPago.charAt(0).toUpperCase() + postMesPago.slice(1)} (Sin recargo)
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Tarifa fijada: <strong>{formatCurrency(postArancel)}</strong>
                      </span>
                    </div>

                    <div className="bg-[#00205B] text-white p-3.5 rounded-xl flex flex-col justify-between shadow-2xs">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                        TOTAL A PERCIBIR HOY
                      </span>
                      <span className="text-2xl font-black tracking-tight">
                        {formatCurrency(postArancel)}
                      </span>
                      <span className="text-[10px] text-slate-300">
                        {selectedInscripcionParaAcreditar
                          ? "Cancelación total de matrícula adeudada"
                          : "Arancel regular oficial"}
                      </span>
                    </div>
                  </div>

                  {/* Selector de Método de Pago */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Seleccione Método de Pago:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPostMetodoPago("Efectivo")}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          postMetodoPago === "Efectivo"
                            ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Efectivo en Ventanilla</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPostMetodoPago("Transferencia")}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          postMetodoPago === "Transferencia"
                            ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Transferencia Bancaria</span>
                      </button>
                    </div>

                    {/* Sub-paneles según método */}
                    {postMetodoPago === "Efectivo" ? (
                      <CalculadoraVuelto
                        totalACobrar={postArancel}
                        montoRecibido={montoRecibidoMatricula}
                        onMontoRecibidoChange={setMontoRecibidoMatricula}
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                        <label className="block text-xs font-bold text-blue-900">
                          Número de Comprobante / Referencia Bancaria (Obligatorio):
                        </label>
                        <input
                          type="text"
                          value={comprobanteRefMatricula}
                          onChange={(e) => setComprobanteRefMatricula(e.target.value)}
                          placeholder="ej: TRF-BAPRO-994120 o MP-8912384"
                          required
                          className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-[10px] text-blue-700 block">
                          Banco Provincia · CBU: 0140999801200018294812 · Titular: Cultural Inglesa de Ensenada
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de Confirmación y Emisión */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-500">
                      Al confirmar, se emitirá automáticamente el <strong>Recibo No Fiscal</strong> correlativo.
                    </span>
                    <Button
                      type="submit"
                      variant="coral"
                      size="md"
                      className="font-bold shadow-md shadow-[#E63956]/20"
                      icon={<Receipt className="w-4 h-4" />}
                    >
                      {selectedInscripcionParaAcreditar
                        ? `Acreditar Deuda de ${formatCurrency(postArancel)} y Emitir Recibo`
                        : `Cobrar ${formatCurrency(postArancel)} y Emitir Recibo`}
                    </Button>
                  </div>
                </form>
              </div>
            )}
      </div>

      <DataTable
        title="Libro de Inscripciones y Matriculaciones"
        subtitle="Control de altas de matrícula por ciclo lectivo con esquema de aranceles escalonados según mes fijado por la administración (sin recargos por mora)"
        data={inscripciones}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nueva Matrícula"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        initialPageSize={8}
      />

      {/* MODAL 2: FORMULARIO REGULAR DE MATRICULACIÓN */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Matrícula" : "Formulario de Matriculación Oficial"}
        subtitle="Vincule al estudiante con la comisión y aplique el arancel según el mes de pago fijado"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRegular} className="space-y-4 py-2">
          <Select
            label="Estudiante a Matricular"
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.nombreCompleto} (DNI ${e.dni}) - Legajo: ${e.legajoNumero}`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                label="Comisión y Turno de Destino"
                value={comisionId}
                onChange={(e) => setComisionId(e.target.value)}
                options={comisiones.map((c) => ({
                  value: c.id,
                  label: `${c.nombre} (${c.cupoOcupado}/${c.cupoMaximo} cupos)`,
                }))}
              />
              {selectedComisionObj && (
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Ocupación actual: {selectedComisionObj.cupoOcupado} de {selectedComisionObj.cupoMaximo}
                  </span>
                  {isCupoFull ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> ¡Cupo Completo!
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold">
                      ✓ Vacantes disponibles
                    </span>
                  )}
                </div>
              )}
            </div>

            <Select
              label="Gestión / Ciclo Lectivo"
              value={cicloLectivo}
              onChange={(e) => setCicloLectivo(e.target.value)}
              options={ciclosLectivos.map((c) => ({
                value: c.nombre,
                label: `${c.nombre} (${c.status})`,
              }))}
            />
          </div>

          {/* Month-based Fee Scale Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Arancel de Matrícula (Asignado por Mes — Sin Mora)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Exento de Mora
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Mes de Pago (Resolución de Administración)"
                value={mesPagoSeleccionado}
                onChange={(e) => handleMesChange(e.target.value)}
                options={ESCALA_MESES_MATRICULA.map((e) => ({
                  value: e.value,
                  label: e.label,
                }))}
              />

              <Input
                label="Monto Matrícula (ARS)"
                type="number"
                value={arancelMatricula}
                onChange={(e) => setArancelMatricula(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Forma de Pago del Arancel"
              value={metodoPago}
              onChange={(e) =>
                setMetodoPago(e.target.value as InscripcionItem["metodoPago"])
              }
              options={[
                { value: "Transferencia", label: "Transferencia Bancaria" },
                { value: "Efectivo", label: "Efectivo en Ventanilla" },
                { value: "Tarjeta", label: "Tarjeta de Débito/Crédito" },
              ]}
            />
            <Select
              label="Estado de Matrícula"
              value={estado}
              onChange={(e) => setEstado(e.target.value as InscripcionItem["estado"])}
              options={[
                { value: "Confirmada", label: "Confirmada" },
                { value: "Pendiente", label: "Pendiente de Pago" },
                { value: "Anulada", label: "Anulada" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones Administrativas
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Convenios especiales, bonificación por hermanos, constancias..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="coral" size="sm">
              {isEditing ? "Guardar Modificaciones" : "Confirmar Matriculación"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedIns?.numeroMatricula || "Detalle de Inscripción"}
        maxWidth="md"
      >
        {selectedIns && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Matrícula:</span>
                <span className="font-bold text-[#00205B]">{selectedIns.numeroMatricula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estudiante:</span>
                <span className="font-bold text-slate-900">{selectedIns.estudianteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-mono">{selectedIns.estudianteDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comisión Asignada:</span>
                <span className="font-semibold">{selectedIns.comisionNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ciclo Lectivo:</span>
                <span>{selectedIns.cicloLectivo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Inscripción:</span>
                <span>{formatDate(selectedIns.fechaMatriculacion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arancel Abonado:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(selectedIns.arancelMatricula)} ({selectedIns.metodoPago})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <Badge variant={selectedIns.estado === "Confirmada" ? "success" : "warning"} size="sm">
                  {selectedIns.estado}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Observaciones:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600">
                {selectedIns.observaciones || "Sin observaciones registradas."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              {selectedIns.estado === "Pendiente" && (
                <Button
                  variant="coral"
                  size="sm"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleSeleccionarParaAcreditar(selectedIns);
                  }}
                  icon={<Receipt className="w-3.5 h-3.5" />}
                  className="font-bold shadow-xs"
                >
                  Acreditar Deuda en Ventanilla
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Anular Registro de Inscripción?"
        description={`¿Confirma que desea anular la matrícula "${selectedIns?.numeroMatricula}" del alumno ${selectedIns?.estudianteNombre}?`}
        confirmText="Anular Matrícula"
      />

      {/* RECIBO NO FISCAL OFICIAL (PREVISUALIZACIÓN Y EMISIÓN INMEDIATA TRAS COBRO) */}
      <ReciboNoFiscalModal
        isOpen={reciboModalOpen}
        onClose={() => setReciboModalOpen(false)}
        cobranza={lastCobranzaEmitida}
      />
    </div>
  );
}

export default function InscripcionesPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Cargando matriculaciones...</div>}>
      <InscripcionesContent />
    </Suspense>
  );
}
