"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { RoleItem } from "@/features/roles/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function RolesPage(): React.ReactElement {
  const { roles, addRol, updateRol, deleteRol } = useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedRol, setSelectedRol] = useState<RoleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState<RoleItem["color"]>("navy");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedRol(null);
    setCodigo(`ROLE_CUSTOM_${Date.now().toString().slice(-3)}`);
    setNombre("");
    setDescripcion("");
    setColor("navy");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: RoleItem) => {
    setIsEditing(true);
    setSelectedRol(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setDescripcion(item.descripcion);
    setColor(item.color);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: RoleItem) => {
    setSelectedRol(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: RoleItem) => {
    if (item.esSistema) {
      alert("Los roles esenciales del sistema no pueden ser eliminados.");
      return;
    }
    setSelectedRol(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedRol) {
      updateRol({
        ...selectedRol,
        codigo,
        nombre,
        descripcion,
        color,
      });
    } else {
      const newRol: RoleItem = {
        id: `rol-${Date.now()}`,
        codigo,
        nombre,
        descripcion,
        usuariosAsignados: 0,
        totalPermisos: 5,
        esSistema: false,
        color,
        permisos: ["alumnos.ver", "calificaciones.ver"],
      };
      addRol(newRol);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedRol) {
      deleteRol(selectedRol.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "roles_sistema_eis",
      [
        { header: "Código", accessor: "codigo" },
        { header: "Nombre del Rol", accessor: "nombre" },
        { header: "Usuarios Asignados", accessor: "usuariosAsignados" },
        { header: "Permisos Asignados", accessor: "totalPermisos" },
        { header: "Es Rol de Sistema", accessor: (r) => (r.esSistema ? "SÍ" : "NO") },
        { header: "Descripción", accessor: "descripcion" },
      ],
      roles
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Catálogo de Roles de Acceso Institucional - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Rol</th>
            <th>Descripción</th>
            <th>Usuarios</th>
            <th>Permisos</th>
          </tr>
        </thead>
        <tbody>
          ${roles
            .map(
              (r) => `
            <tr>
              <td><strong>${r.codigo}</strong></td>
              <td>${r.nombre}</td>
              <td>${r.descripcion}</td>
              <td>${r.usuariosAsignados} cuentas</td>
              <td>${r.totalPermisos} permisos</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Catálogo de Roles y Privilegios", htmlBody);
  };

  const columns: ColumnDef<RoleItem>[] = [
    {
      id: "codigo",
      header: "Código RBAC",
      accessorKey: "codigo",
      sortable: true,
      className: "w-36 font-bold text-[#00205B]",
    },
    {
      id: "nombre",
      header: "Rol",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombre}</span>
          <span className="text-[11px] text-slate-400">{item.descripcion}</span>
        </div>
      ),
    },
    {
      id: "usuarios",
      header: "Usuarios Asignados",
      accessorKey: "usuariosAsignados",
      sortable: true,
      cell: (item) => (
        <span className="font-semibold text-slate-800">
          {item.usuariosAsignados} cuentas
        </span>
      ),
    },
    {
      id: "permisos",
      header: "Permisos",
      cell: (item) => (
        <span className="text-xs font-bold text-[#00205B] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {item.totalPermisos} permisos
        </span>
      ),
    },
    {
      id: "esSistema",
      header: "Tipo",
      cell: (item) => (
        <Badge variant={item.esSistema ? "coral" : "default"} size="sm">
          {item.esSistema ? "Sistema" : "Personalizado"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Roles de Acceso y Perfiles RBAC"
        subtitle="Definición de roles para Directora, Administrador, Secretaría, Docentes y Alumnos"
        data={roles}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Rol"
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
        title={isEditing ? "Editar Rol" : "Nuevo Rol de Acceso"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Input
            label="Código Técnico (ej: ROLE_COORDINADOR)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
          <Input
            label="Nombre del Rol"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción del Perfil y Alcances
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
              {isEditing ? "Guardar Modificaciones" : "Crear Rol"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedRol?.nombre || "Detalle del Rol"}
        maxWidth="md"
      >
        {selectedRol && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Código Técnico:</span>
                <span className="font-bold text-[#00205B]">{selectedRol.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Usuarios Asignados:</span>
                <span className="font-semibold">{selectedRol.usuariosAsignados} cuentas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Permisos:</span>
                <span className="font-bold text-[#00205B]">{selectedRol.totalPermisos}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Lista de Permisos Asociados:
              </span>
              <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                {selectedRol.permisos.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border"
                  >
                    {p}
                  </span>
                ))}
              </div>
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
        title="¿Eliminar Rol?"
        description={`¿Confirma que desea eliminar el rol "${selectedRol?.nombre}"?`}
        confirmText="Eliminar Rol"
      />
    </div>
  );
}
