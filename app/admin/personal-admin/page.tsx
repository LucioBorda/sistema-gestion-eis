"use client";

import React, { useState } from "react";
import { useGlobalData } from "@/features/core/DataContext";
import { PersonalAdminItem } from "@/features/personal-admin/types";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { exportToExcelCSV, openInstitutionalPrintPreview } from "@/lib/exportUtils";

export default function PersonalAdminPage(): React.ReactElement {
  const { personalAdmin, addPersonalAdmin, updatePersonalAdmin, deletePersonalAdmin } =
    useGlobalData();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<PersonalAdminItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [dni, setDni] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("2024-03-01");
  const [horarioAtencion, setHorarioAtencion] = useState("Lunes a Viernes 08:30 - 16:30 hs");
  const [estado, setEstado] = useState<PersonalAdminItem["estado"]>("Activo");

  const handleOpenNew = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setDni("");
    setNombreCompleto("");
    setCargo("Secretaria de Atención al Público");
    setTelefono("(0221) 15-");
    setEmail("");
    setFechaIngreso(new Date().toISOString().slice(0, 10));
    setHorarioAtencion("Lunes a Viernes 08:30 - 16:30 hs");
    setEstado("Activo");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PersonalAdminItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setDni(item.dni);
    setNombreCompleto(item.nombreCompleto);
    setCargo(item.cargo);
    setTelefono(item.telefono);
    setEmail(item.email);
    setFechaIngreso(item.fechaIngreso);
    setHorarioAtencion(item.horarioAtencion);
    setEstado(item.estado);
    setModalOpen(true);
  };

  const handleOpenDetail = (item: PersonalAdminItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: PersonalAdminItem) => {
    setSelectedItem(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedItem) {
      updatePersonalAdmin({
        ...selectedItem,
        dni,
        nombreCompleto,
        cargo,
        telefono,
        email,
        fechaIngreso,
        horarioAtencion,
        estado,
      });
    } else {
      const newItem: PersonalAdminItem = {
        id: `adm-${Date.now()}`,
        dni,
        nombreCompleto,
        cargo,
        telefono,
        email,
        fechaIngreso,
        horarioAtencion,
        estado,
      };
      addPersonalAdmin(newItem);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deletePersonalAdmin(selectedItem.id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcelCSV(
      "personal_administrativo_eis",
      [
        { header: "DNI", accessor: "dni" },
        { header: "Nombre y Apellido", accessor: "nombreCompleto" },
        { header: "Cargo / Función", accessor: "cargo" },
        { header: "Teléfono", accessor: "telefono" },
        { header: "Email", accessor: "email" },
        { header: "Fecha de Ingreso", accessor: (p) => formatDate(p.fechaIngreso) },
        { header: "Horario de Trabajo", accessor: "horarioAtencion" },
        { header: "Estado", accessor: "estado" },
      ],
      personalAdmin
    );
  };

  const handleExportPdf = () => {
    const htmlBody = `
      <p style="font-size: 13px;">Padrón de Personal Administrativo y de Apoyo - EIS Institute:</p>
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre Completo</th>
            <th>Cargo</th>
            <th>Contacto</th>
            <th>Fecha Ingreso</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${personalAdmin
            .map(
              (p) => `
            <tr>
              <td><strong>${p.dni}</strong></td>
              <td>${p.nombreCompleto}</td>
              <td>${p.cargo}</td>
              <td>${p.telefono} | ${p.email}</td>
              <td>${formatDate(p.fechaIngreso)}</td>
              <td>${p.estado}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    openInstitutionalPrintPreview("Padrón del Personal Administrativo", htmlBody);
  };

  const columns: ColumnDef<PersonalAdminItem>[] = [
    {
      id: "dni",
      header: "DNI",
      accessorKey: "dni",
      sortable: true,
      className: "w-28 font-mono font-bold text-slate-800",
    },
    {
      id: "nombre",
      header: "Personal Administrativo",
      accessorKey: "nombreCompleto",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.nombreCompleto}</span>
          <span className="text-[11px] text-slate-400">{item.email}</span>
        </div>
      ),
    },
    {
      id: "cargo",
      header: "Cargo / Función",
      accessorKey: "cargo",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-xs font-semibold text-[#00205B] block">{item.cargo}</span>
          <span className="text-[11px] text-slate-400">{item.horarioAtencion}</span>
        </div>
      ),
    },
    {
      id: "telefono",
      header: "Teléfono",
      accessorKey: "telefono",
      cell: (item) => <span className="text-xs text-slate-600">{item.telefono}</span>,
    },
    {
      id: "ingreso",
      header: "Fecha Ingreso",
      cell: (item) => <span className="text-xs text-slate-600">{formatDate(item.fechaIngreso)}</span>,
    },
    {
      id: "estado",
      header: "Estado",
      cell: (item) => (
        <Badge
          variant={
            item.estado === "Activo"
              ? "success"
              : item.estado === "Licencia"
              ? "warning"
              : "default"
          }
          size="sm"
        >
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Personal Administrativo y Maestranza"
        subtitle="Fichas de secretaría académica, tesorería y equipo técnico de la sede La Paz"
        data={personalAdmin}
        columns={columns}
        keyExtractor={(item) => item.id}
        onAddNew={handleOpenNew}
        addNewLabel="Nuevo Personal"
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
        title={isEditing ? "Editar Ficha de Personal" : "Nuevo Personal Administrativo"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Número de DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <Input
              label="Nombre Completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cargo / Función Institucional"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
            <Select
              label="Estado Laboral"
              value={estado}
              onChange={(e) => setEstado(e.target.value as PersonalAdminItem["estado"])}
              options={[
                { value: "Activo", label: "Activo en Sede" },
                { value: "Licencia", label: "Licencia Médica / Especial" },
                { value: "Inactivo", label: "Inactivo / Baja" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Teléfono Móvil"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <Input
              label="Email de Contacto"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha de Ingreso"
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              required
            />
            <Input
              label="Horario Habitual de Trabajo"
              value={horarioAtencion}
              onChange={(e) => setHorarioAtencion(e.target.value)}
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
              {isEditing ? "Guardar Modificaciones" : "Registrar Empleado"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VER DETALLE */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedItem?.nombreCompleto || "Ficha del Empleado"}
        maxWidth="md"
      >
        {selectedItem && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-bold text-slate-800">{selectedItem.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cargo:</span>
                <span className="font-bold text-[#00205B]">{selectedItem.cargo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-semibold">{selectedItem.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold">{selectedItem.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horario de Trabajo:</span>
                <span className="font-semibold">{selectedItem.horarioAtencion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Ingreso:</span>
                <span className="font-semibold">{formatDate(selectedItem.fechaIngreso)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <Badge variant={selectedItem.estado === "Activo" ? "success" : "warning"} size="sm">
                  {selectedItem.estado}
                </Badge>
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
        title="¿Eliminar Ficha de Personal?"
        description={`¿Confirma que desea eliminar el registro de "${selectedItem?.nombreCompleto}"?`}
        confirmText="Eliminar Personal"
      />
    </div>
  );
}
