"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { PermisoItem } from "@/features/permisos/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function PermisosPage(): React.ReactElement {
  const { permisos, addPermiso, updatePermiso, deletePermiso } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedPermiso, setSelectedPermiso] = useState<PermisoItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [modulo, setModulo] = useState("Estudiantes");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState<PermisoItem["categoria"]>("Escritura");
  const [nivelRiesgo, setNivelRiesgo] = useState<PermisoItem["nivelRiesgo"]>("Medio");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedPermiso(null);
    setCodigo("");
    setModulo("Estudiantes");
    setDescripcion("");
    setCategoria("Escritura");
    setNivelRiesgo("Medio");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PermisoItem) => {
    setIsEditing(true);
    setSelectedPermiso(item);
    setCodigo(item.codigo);
    setModulo(item.modulo);
    setDescripcion(item.descripcion);
    setCategoria(item.categoria);
    setNivelRiesgo(item.nivelRiesgo);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: PermisoItem) => {
    setSelectedPermiso(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: PermisoItem) => {
    setSelectedPermiso(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedPermiso) {
      updatePermiso({
        ...selectedPermiso,
        codigo,
        modulo,
        descripcion,
        categoria,
        nivelRiesgo,
      });
    } else {
      const newPermiso: PermisoItem = {
        id: `perm-${Date.now()}`,
        codigo,
        modulo,
        descripcion,
        categoria,
        nivelRiesgo,
      };
      addPermiso(newPermiso);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedPermiso) {
      deletePermiso(selectedPermiso.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "matriz_permisos_eis",
      [
        { header: "Código de Permiso", accessor: "codigo" },
        { header: "Módulo Funcional", accessor: "modulo" },
        { header: "Categoría", accessor: "categoria" },
        { header: "Nivel de Riesgo", accessor: "nivelRiesgo" },
        { header: "Descripción", accessor: "descripcion" },
      ],
      permisos
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Matriz Granular de Permisos y Niveles de Riesgo - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Módulo</th>
            <th>Categoría</th>
            <th>Riesgo</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          ${permisos
            .map(
              (p) => `
            <tr>
              <td><code>${p.codigo}</code></td>
              <td>${p.modulo}</td>
              <td>${p.categoria}</td>
              <td>${p.nivelRiesgo}</td>
              <td>${p.descripcion}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Matriz Granular de Permisos", htmlBody);
  };

  const columns: ColumnDef<PermisoItem>[] = [
    {
      id: "codigo",
      header: "Código Granular",
      accessorKey: "codigo",
      sortable: true,
      cell: (item) => (
        <code className="text-xs font-mono font-bold text-[#00205B] bg-slate-100 px-2 py-0.5 rounded">
          {item.codigo}
        </code>
      ),
    },
    {
      id: "modulo",
      header: "Módulo Funcional",
      accessorKey: "modulo",
      sortable: true,
      cell: (item) => (
        <span className="font-semibold text-slate-800">{item.modulo}</span>
      ),
    },
    {
      id: "categoria",
      header: "Categoría",
      cell: (item) => (
        <Badge
          variant={
            item.categoria === "Finanzas"
              ? "coral"
              : item.categoria === "Administración"
              ? "danger"
              : "navy"
          }
          size="sm"
        >
          {item.categoria}
        </Badge>
      ),
    },
    {
      id: "riesgo",
      header: "Nivel de Riesgo",
      cell: (item) => (
        <Badge
          variant={
            item.nivelRiesgo === "Alto"
              ? "danger"
              : item.nivelRiesgo === "Medio"
              ? "warning"
              : "success"
          }
          size="sm"
        >
          {item.nivelRiesgo}
        </Badge>
      ),
    },
    {
      id: "descripcion",
      header: "Descripción",
      accessorKey: "descripcion",
      cell: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1">
          {item.descripcion}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Matriz de Permisos Granulares (RBAC)"
        subtitle="Control exhaustivo de operaciones de lectura, escritura, tesorería y administración"
        data={permisos}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Permiso"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        initialPageSize={8}
      />

      {/* MODAL: FORMULARIO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Permiso" : "Nuevo Permiso Granular"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Input
            label="Código Técnico (ej: cuotas.cobrar)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
          <Input
            label="Módulo Funcional"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as PermisoItem["categoria"])}
              options={[
                { value: "Lectura", label: "Lectura" },
                { value: "Escritura", label: "Escritura" },
                { value: "Finanzas", label: "Finanzas / Cobros" },
                { value: "Administración", label: "Administración" },
                { value: "CMS", label: "Gestión Web / CMS" },
              ]}
            />
            <Select
              label="Nivel de Riesgo"
              value={nivelRiesgo}
              onChange={(e) => setNivelRiesgo(e.target.value as PermisoItem["nivelRiesgo"])}
              options={[
                { value: "Bajo", label: "Bajo" },
                { value: "Medio", label: "Medio" },
                { value: "Alto", label: "Alto (Crítico)" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción de la Operación Permitida
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              required
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
              {isEditing ? "Guardar Modificaciones" : "Registrar Permiso"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedPermiso?.codigo || "Detalle del Permiso"}
        maxWidth="md"
      >
        {selectedPermiso && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Código Técnico:</span>
                <code className="font-bold text-[#00205B]">{selectedPermiso.codigo}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Módulo:</span>
                <span className="font-semibold text-slate-800">{selectedPermiso.modulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría:</span>
                <Badge variant="navy" size="sm">{selectedPermiso.categoria}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel de Riesgo:</span>
                <Badge variant={selectedPermiso.nivelRiesgo === "Alto" ? "danger" : "warning"} size="sm">
                  {selectedPermiso.nivelRiesgo}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Descripción:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                {selectedPermiso.descripcion}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
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
        title="¿Eliminar Permiso?"
        description={`¿Confirma que desea eliminar el permiso "${selectedPermiso?.codigo}"?`}
        confirmText="Eliminar Permiso"
      />
    </div>
  );
}
