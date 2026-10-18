"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { UsuarioItem } from "@/features/usuarios/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function UsuariosPage(): React.ReactElement {
  const { usuarios, roles, addUsuario, updateUsuario, deleteUsuario, resetUsuarioPassword } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [rolCodigo, setRolCodigo] = useState("ROLE_SECRETARIA");
  const [estado, setEstado] = useState<UsuarioItem["estado"]>("Activo");
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  );
  const [dosFactores, setDosFactores] = useState(false);

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedUsuario(null);
    setNombreCompleto("");
    setEmail("");
    setRolCodigo("ROLE_SECRETARIA");
    setEstado("Activo");
    setAvatar(
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    );
    setDosFactores(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: UsuarioItem) => {
    setIsEditing(true);
    setSelectedUsuario(item);
    setNombreCompleto(item.nombreCompleto);
    setEmail(item.email);
    setRolCodigo(item.rolCodigo);
    setEstado(item.estado);
    setAvatar(item.avatar);
    setDosFactores(item.dosFactores);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: UsuarioItem) => {
    setSelectedUsuario(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: UsuarioItem) => {
    setSelectedUsuario(item);
    setConfirmDeleteOpen(true);
  };

  const handleResetPassword = (item: UsuarioItem) => {
    resetUsuarioPassword(item.id);
    setResetSuccessMessage(
      `Se ha enviado un correo con instrucciones para restablecer la contraseña a: ${item.email}`
    );
    setTimeout(() => setResetSuccessMessage(null), 5000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const roleObj = roles.find((r) => r.codigo === rolCodigo);
    const rolNombre = roleObj ? roleObj.nombre : "Usuario General";

    if (isEditing && selectedUsuario) {
      updateUsuario({
        ...selectedUsuario,
        nombreCompleto,
        email,
        rol: rolNombre,
        rolCodigo,
        estado,
        avatar,
        dosFactores,
      });
    } else {
      const newUsuario: UsuarioItem = {
        id: `usr-${Date.now()}`,
        nombreCompleto,
        email,
        rol: rolNombre,
        rolCodigo,
        estado,
        ultimoAcceso: "Nunca",
        creadoEl: new Date().toISOString().slice(0, 10),
        avatar,
        dosFactores,
      };
      addUsuario(newUsuario);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedUsuario) {
      deleteUsuario(selectedUsuario.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "usuarios_sistema_eis",
      [
        { header: "Nombre Completo", accessor: "nombreCompleto" },
        { header: "Email Institucional", accessor: "email" },
        { header: "Rol Asignado", accessor: "rol" },
        { header: "Estado", accessor: "estado" },
        { header: "Último Acceso", accessor: "ultimoAcceso" },
        { header: "2FA Habilitado", accessor: (u) => (u.dosFactores ? "SÍ" : "NO") },
      ],
      usuarios
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Listado de Cuentas de Acceso y Estado de Seguridad - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Último Acceso</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios
            .map(
              (u) => `
            <tr>
              <td><strong>${u.nombreCompleto}</strong></td>
              <td>${u.email}</td>
              <td>${u.rol}</td>
              <td>${u.estado}</td>
              <td>${u.ultimoAcceso}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón de Usuarios del Sistema", htmlBody);
  };

  const columns: ColumnDef<UsuarioItem>[] = [
    {
      id: "usuario",
      header: "Usuario / Identidad",
      accessorKey: "nombreCompleto",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.avatar}
            alt={item.nombreCompleto}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block">{item.nombreCompleto}</span>
            <span className="text-[11px] text-slate-400">{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "rol",
      header: "Rol de Seguridad",
      accessorKey: "rol",
      sortable: true,
      cell: (item) => (
        <Badge
          variant={
            item.rolCodigo === "ROLE_DIRECTORA"
              ? "coral"
              : item.rolCodigo === "ROLE_DOCENTE"
              ? "info"
              : "navy"
          }
          size="sm"
        >
          {item.rol}
        </Badge>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge variant={item.estado === "Activo" ? "success" : "danger"} size="sm">
          {item.estado}
        </Badge>
      ),
    },
    {
      id: "ultimoAcceso",
      header: "Última Conexión",
      accessorKey: "ultimoAcceso",
      cell: (item) => <span className="text-xs text-slate-600">{item.ultimoAcceso}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {resetSuccessMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-[#00205B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00205B]" />
          {resetSuccessMessage}
        </div>
      )}

      <DataTable
        title="Cuentas de Usuarios del Sistema"
        subtitle="Control de credenciales, roles asignados, suspensiones y reseteo de claves"
        data={usuarios}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Usuario"
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        customRowActions={(item) => (
          <button
            onClick={() => handleResetPassword(item)}
            title="Resetear Contraseña"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#00205B] hover:bg-blue-50 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        )}
        initialPageSize={8}
      />

      {/* MODAL: FORMULARIO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Usuario" : "Nueva Cuenta de Usuario"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Input
            label="Nombre Completo"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
          />
          <Input
            label="Email Institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@culturalensenada.edu.ar"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Rol Asignado"
              value={rolCodigo}
              onChange={(e) => setRolCodigo(e.target.value)}
              options={roles.map((r) => ({
                value: r.codigo,
                label: r.nombre,
              }))}
            />
            <Select
              label="Estado de la Cuenta"
              value={estado}
              onChange={(e) => setEstado(e.target.value as UsuarioItem["estado"])}
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Suspendido", label: "Suspendido" },
              ]}
            />
          </div>

          <Input
            label="URL de Foto de Perfil / Avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={dosFactores}
                onChange={(e) => setDosFactores(e.target.checked)}
                className="rounded text-[#00205B] focus:ring-[#00205B] w-4 h-4"
              />
              <span>Exigir autenticación de doble factor (2FA)</span>
            </label>
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
              {isEditing ? "Guardar Modificaciones" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedUsuario?.nombreCompleto || "Ficha de Usuario"}
        maxWidth="md"
      >
        {selectedUsuario && (
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedUsuario.avatar}
                alt={selectedUsuario.nombreCompleto}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00205B]"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedUsuario.nombreCompleto}
                </h4>
                <div className="text-slate-500 mt-0.5">{selectedUsuario.email}</div>
                <div className="mt-1.5 flex gap-2">
                  <Badge variant="navy" size="sm">{selectedUsuario.rol}</Badge>
                  <Badge variant={selectedUsuario.estado === "Activo" ? "success" : "danger"} size="sm">
                    {selectedUsuario.estado}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Último Acceso Registrado:</span>
                <span className="font-semibold text-slate-800">{selectedUsuario.ultimoAcceso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Alta:</span>
                <span className="font-semibold text-slate-800">{selectedUsuario.creadoEl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">2FA Activado:</span>
                <span className="font-semibold">{selectedUsuario.dosFactores ? "Sí" : "No"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleResetPassword(selectedUsuario);
                  setDetailModalOpen(false);
                }}
                icon={<KeyRound className="w-4 h-4" />}
              >
                Resetear Clave
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
        title="¿Eliminar Cuenta de Usuario?"
        description={`¿Confirma que desea eliminar la cuenta de "${selectedUsuario?.nombreCompleto}"?`}
        confirmText="Eliminar Usuario"
      />
    </div>
  );
}
