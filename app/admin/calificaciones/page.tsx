"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { CalificacionItem } from "@/features/calificaciones/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { FileSpreadsheet, FileCheck, Printer } from "lucide-react";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function CalificacionesPage(): React.ReactElement {
  const { calificaciones, estudiantes, materias, comisiones, addCalificacion, updateCalificacion, deleteCalificacion } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedCal, setSelectedCal] = useState<CalificacionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || "");
  const [materiaId, setMateriaId] = useState(materias[0]?.id || "");
  const [comisionId, setComisionId] = useState(comisiones[0]?.id || "");
  const [primerParcial, setPrimerParcial] = useState<number | string>(8);
  const [segundoParcial, setSegundoParcial] = useState<number | string>(8.5);
  const [trabajosPracticos, setTrabajosPracticos] = useState<number | string>(9);
  const [examenFinal, setExamenFinal] = useState<number | string>("");
  const [observacionesDocente, setObservacionesDocente] = useState("");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedCal(null);
    setEstudianteId(estudiantes[0]?.id || "");
    setMateriaId(materias[0]?.id || "");
    setComisionId(comisiones[0]?.id || "");
    setPrimerParcial(8);
    setSegundoParcial(8.5);
    setTrabajosPracticos(9);
    setExamenFinal("");
    setObservacionesDocente("Buen desempeño en destrezas de lectoescritura.");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CalificacionItem) => {
    setIsEditing(true);
    setSelectedCal(item);
    setEstudianteId(item.estudianteId);
    setMateriaId(item.materiaId);
    setComisionId(item.comisionId);
    setPrimerParcial(item.primerParcial ?? "");
    setSegundoParcial(item.segundoParcial ?? "");
    setTrabajosPracticos(item.trabajosPracticos ?? "");
    setExamenFinal(item.examenFinal ?? "");
    setObservacionesDocente(item.observacionesDocente);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: CalificacionItem) => {
    setSelectedCal(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: CalificacionItem) => {
    setSelectedCal(item);
    setConfirmDeleteOpen(true);
  };

  const calculateAverageAndStatus = (
    p1: number | null,
    p2: number | null,
    tp: number | null,
    ef: number | null
  ) => {
    const validScores: number[] = [];
    if (p1 !== null) validScores.push(p1);
    if (p2 !== null) validScores.push(p2);
    if (tp !== null) validScores.push(tp);

    if (validScores.length === 0) return { avg: null, status: "En Curso" as const };

    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = Number((sum / validScores.length).toFixed(1));

    let status: CalificacionItem["estadoAprobacion"] = "En Curso";
    if (ef !== null) {
      status = ef >= 7 ? "Aprobado" : "Desaprobado";
    } else {
      if (avg >= 7) status = "Aprobado";
      else if (avg >= 5) status = "Recuperatorio";
      else status = "Desaprobado";
    }

    return { avg, status };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const estObj = estudiantes.find((e) => e.id === estudianteId);
    const matObj = materias.find((m) => m.id === materiaId);
    const comObj = comisiones.find((c) => c.id === comisionId);

    const estudianteNombre = estObj ? estObj.nombreCompleto : "Alumno";
    const dni = estObj ? estObj.dni : "00000000";
    const materiaNombre = matObj ? matObj.nombre : "Materia";
    const comisionNombre = comObj ? comObj.nombre : "Comisión";

    const p1 = primerParcial === "" ? null : Number(primerParcial);
    const p2 = segundoParcial === "" ? null : Number(segundoParcial);
    const tp = trabajosPracticos === "" ? null : Number(trabajosPracticos);
    const ef = examenFinal === "" ? null : Number(examenFinal);

    const { avg, status } = calculateAverageAndStatus(p1, p2, tp, ef);

    if (isEditing && selectedCal) {
      updateCalificacion({
        ...selectedCal,
        estudianteId,
        estudianteNombre,
        dni,
        comisionId,
        comisionNombre,
        materiaId,
        materiaNombre,
        primerParcial: p1,
        segundoParcial: p2,
        trabajosPracticos: tp,
        examenFinal: ef,
        promedioFinal: avg,
        estadoAprobacion: status,
        fechaUltimaCarga: new Date().toLocaleDateString("es-AR"),
        observacionesDocente,
      });
    } else {
      const newCal: CalificacionItem = {
        id: `cal-${Date.now()}`,
        estudianteId,
        estudianteNombre,
        dni,
        comisionId,
        comisionNombre,
        materiaId,
        materiaNombre,
        primerParcial: p1,
        segundoParcial: p2,
        trabajosPracticos: tp,
        examenFinal: ef,
        promedioFinal: avg,
        estadoAprobacion: status,
        fechaUltimaCarga: new Date().toLocaleDateString("es-AR"),
        observacionesDocente,
      };
      addCalificacion(newCal);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCal) {
      deleteCalificacion(selectedCal.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handlePrintBoletin = (item: CalificacionItem) => {
    const htmlBody = `
      <div style="font-size: 13px; line-height: 1.6;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #00205B; text-align: center;">BOLETÍN OFICIAL DE CALIFICACIONES</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Estudiante:</strong> ${item.estudianteNombre}</div>
            <div><strong>DNI:</strong> ${item.dni}</div>
            <div><strong>Comisión:</strong> ${item.comisionNombre}</div>
            <div><strong>Ciclo Lectivo:</strong> 2026 (En Curso)</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Asignatura / Trayecto</th>
              <th style="text-align: center;">1º Parcial</th>
              <th style="text-align: center;">2º Parcial</th>
              <th style="text-align: center;">Trabajos Prácticos</th>
              <th style="text-align: center;">Examen Final</th>
              <th style="text-align: center;">Promedio Final</th>
              <th style="text-align: center;">Condición</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${item.materiaNombre}</strong></td>
              <td style="text-align: center;">${item.primerParcial ?? "-"}</td>
              <td style="text-align: center;">${item.segundoParcial ?? "-"}</td>
              <td style="text-align: center;">${item.trabajosPracticos ?? "-"}</td>
              <td style="text-align: center;">${item.examenFinal ?? "-"}</td>
              <td style="text-align: center; font-weight: bold; color: #00205B; font-size: 15px;">
                ${item.promedioFinal ?? "-"}
              </td>
              <td style="text-align: center; font-weight: bold;">${item.estadoAprobacion}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 24px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;">
          <strong>Apreciación del Docente Titular:</strong>
          <p style="margin: 6px 0 0 0; color: #475569;">${item.observacionesDocente || "Desempeño satisfactorio acorde a los objetivos pedagógicos."}</p>
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line">Profesor / Docente Titular</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Cátedra de Inglés</div>
          </div>
          <div>
            <div class="sig-line">Firma del Tutor</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Notificado</div>
          </div>
        </div>
      </div>
    `;
    openInstitutionalPrintPreview(`Boletin_${item.dni}`, htmlBody);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "acta_calificaciones_eis",
      [
        { header: "Estudiante", accessor: "estudianteNombre" },
        { header: "DNI", accessor: "dni" },
        { header: "Comisión", accessor: "comisionNombre" },
        { header: "Materia", accessor: "materiaNombre" },
        { header: "1º Parcial", accessor: (c) => c.primerParcial ?? "-" },
        { header: "2º Parcial", accessor: (c) => c.segundoParcial ?? "-" },
        { header: "Trabajos Prácticos", accessor: (c) => c.trabajosPracticos ?? "-" },
        { header: "Examen Final", accessor: (c) => c.examenFinal ?? "-" },
        { header: "Promedio Final", accessor: (c) => c.promedioFinal ?? "-" },
        { header: "Estado", accessor: "estadoAprobacion" },
      ],
      calificaciones
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Acta General de Calificaciones y Rendimiento Académico - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Comisión</th>
            <th>Materia</th>
            <th>1º Parcial</th>
            <th>2º Parcial</th>
            <th>TPs</th>
            <th>Promedio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${calificaciones
            .map(
              (c) => `
            <tr>
              <td><strong>${c.estudianteNombre}</strong></td>
              <td>${c.comisionNombre}</td>
              <td>${c.materiaNombre}</td>
              <td style="text-align: center;">${c.primerParcial ?? "-"}</td>
              <td style="text-align: center;">${c.segundoParcial ?? "-"}</td>
              <td style="text-align: center;">${c.trabajosPracticos ?? "-"}</td>
              <td style="text-align: center; font-weight: bold;">${c.promedioFinal ?? "-"}</td>
              <td>${c.estadoAprobacion}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Acta General de Calificaciones", htmlBody);
  };

  const columns: ColumnDef<CalificacionItem>[] = [
    {
      id: "estudiante",
      header: "Estudiante / DNI",
      accessorKey: "estudianteNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.estudianteNombre}</span>
          <span className="text-[11px] font-mono text-slate-400">DNI {item.dni}</span>
        </div>
      ),
    },
    {
      id: "materia",
      header: "Materia / Comisión",
      accessorKey: "materiaNombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-semibold text-[#00205B] block">{item.materiaNombre}</span>
          <span className="text-[11px] text-slate-400">{item.comisionNombre}</span>
        </div>
      ),
    },
    {
      id: "parciales",
      header: "1º / 2º Parcial",
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">
          {item.primerParcial ?? "-"} / {item.segundoParcial ?? "-"}
        </span>
      ),
    },
    {
      id: "tps",
      header: "TPs",
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">
          {item.trabajosPracticos ?? "-"}
        </span>
      ),
    },
    {
      id: "promedio",
      header: "Promedio Final",
      accessorKey: "promedioFinal",
      sortable: true,
      cell: (item) => (
        <span className="text-sm font-black text-[#00205B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {item.promedioFinal !== null ? item.promedioFinal.toFixed(1) : "-"}
        </span>
      ),
    },
    {
      id: "estado",
      header: "Condición",
      cell: (item) => (
        <Badge
          variant={
            item.estadoAprobacion === "Aprobado"
              ? "success"
              : item.estadoAprobacion === "Recuperatorio"
              ? "warning"
              : item.estadoAprobacion === "En Curso"
              ? "navy"
              : "danger"
          }
          size="sm"
        >
          {item.estadoAprobacion}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Calificaciones y Actas Académicas"
        subtitle="Carga de parciales, cálculo automático de promedios ponderados y emisión de boletines oficiales"
        data={calificaciones}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Cargar Calificación"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        customRowActions={(item) => (
          <button
            onClick={() => handlePrintBoletin(item)}
            title="Emitir Boletín Oficial PDF"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#00205B] hover:bg-blue-50 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
          </button>
        )}
        initialPageSize={8}
      />

      {/* MODAL: FORMULARIO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Calificación" : "Carga de Notas y Evaluaciones"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Select
            label="Estudiante"
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.nombreCompleto} (DNI ${e.dni})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Materia Curricular"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              options={materias.map((m) => ({
                value: m.id,
                label: `${m.nombre} (${m.nivelNombre})`,
              }))}
            />
            <Select
              label="Comisión / Grado"
              value={comisionId}
              onChange={(e) => setComisionId(e.target.value)}
              options={comisiones.map((c) => ({
                value: c.id,
                label: c.nombre,
              }))}
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Input
              label="1º Parcial (1-10)"
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={primerParcial}
              onChange={(e) => setPrimerParcial(e.target.value)}
            />
            <Input
              label="2º Parcial (1-10)"
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={segundoParcial}
              onChange={(e) => setSegundoParcial(e.target.value)}
            />
            <Input
              label="Trabajos Prácticos"
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={trabajosPracticos}
              onChange={(e) => setTrabajosPracticos(e.target.value)}
            />
            <Input
              label="Examen Final (Opcional)"
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={examenFinal}
              onChange={(e) => setExamenFinal(e.target.value)}
              placeholder="S/Rendir"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones Pedagógicas del Docente
            </label>
            <textarea
              rows={2}
              value={observacionesDocente}
              onChange={(e) => setObservacionesDocente(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              placeholder="Detalle de aspectos a reforzar, pronunciación, destrezas Anglia..."
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
              {isEditing ? "Guardar Modificaciones" : "Asentar Calificaciones"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCal?.estudianteNombre || "Detalle de Calificaciones"}
        maxWidth="md"
      >
        {selectedCal && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Estudiante:</span>
                <span className="font-bold text-slate-900">{selectedCal.estudianteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Materia:</span>
                <span className="font-bold text-[#00205B]">{selectedCal.materiaNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comisión:</span>
                <span>{selectedCal.comisionNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">1º Parcial:</span>
                <span className="font-semibold">{selectedCal.primerParcial ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">2º Parcial:</span>
                <span className="font-semibold">{selectedCal.segundoParcial ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trabajos Prácticos:</span>
                <span className="font-semibold">{selectedCal.trabajosPracticos ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Promedio Calculado:</span>
                <span className="font-bold text-base text-[#00205B]">
                  {selectedCal.promedioFinal !== null ? selectedCal.promedioFinal.toFixed(1) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Condición:</span>
                <Badge variant={selectedCal.estadoAprobacion === "Aprobado" ? "success" : "warning"} size="sm">
                  {selectedCal.estadoAprobacion}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Anotaciones del Docente:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600">
                {selectedCal.observacionesDocente || "Sin anotaciones adicionales."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handlePrintBoletin(selectedCal);
                  setDetailModalOpen(false);
                }}
                icon={<Printer className="w-4 h-4 text-[#00205B]" />}
              >
                Imprimir Boletín
              </Button>
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
        title="¿Eliminar Calificación?"
        description="¿Confirma que desea eliminar este registro de notas del acta?"
        confirmText="Eliminar Registro"
      />
    </div>
  );
}
