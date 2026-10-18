"use client";

import React, { useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Award,
  FileText,
  Save,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { useGlobalData } from "@/features/core/DataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { openInstitutionalPrintPreview, exportToExcelCSV } from "@/lib/exportUtils";

export default function InstitucionPage(): React.ReactElement {
  const { institucion, setInstitucion } = useGlobalData();
  const [formData, setFormData] = useState(institucion);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setInstitucion(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrintInstitutionalSheet = () => {
    const htmlBody = `
      <div style="font-size: 13px; line-height: 1.6;">
        <h3 style="color: #00205B; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Ficha Técnica Institucional</h3>
        <p><strong>Nombre de Fantasía:</strong> ${formData.nombreComercial}</p>
        <p><strong>Razón Social:</strong> ${formData.razonSocial}</p>
        <p><strong>CUIT:</strong> ${formData.cuit}</p>
        <p><strong>Sede Central:</strong> ${formData.sedePrincipal}</p>
        <p><strong>Teléfono Oficial:</strong> ${formData.telefono}</p>
        <p><strong>Email Institucional:</strong> ${formData.emailOficial}</p>
        <p><strong>Directora General:</strong> ${formData.directoraGeneral}</p>
        <p><strong>Resolución Ministerial:</strong> ${formData.resolucionMinisterial}</p>

        <h3 style="color: #00205B; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 24px;">Convenios Oficiales Vigentes</h3>
        <table>
          <thead>
            <tr>
              <th>Entidad / Convenio</th>
              <th>Tipo de Aval</th>
              <th>Código Sede</th>
              <th>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            ${formData.convenios
              .map(
                (c) => `
              <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.tipo}</td>
                <td>${c.codigoSede}</td>
                <td>Desde ${c.vigenteDesde}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    openInstitutionalPrintPreview("Ficha Técnica Institucional", htmlBody);
  };

  const handleExportCSV = () => {
    exportToExcelCSV(
      "convenios_institucionales_eis",
      [
        { header: "Entidad", accessor: (c) => c.nombre },
        { header: "Tipo de Convenio", accessor: (c) => c.tipo },
        { header: "Código Oficial", accessor: (c) => c.codigoSede },
        { header: "Vigente Desde", accessor: (c) => c.vigenteDesde },
        { header: "Descripción", accessor: (c) => c.descripcion },
      ],
      formData.convenios
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#00205B]">
            Datos Institucionales de EIS Institute
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Información legal, sede central, personería jurídica y convenios oficiales Anglia y UTN
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Exportar Convenios
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintInstitutionalSheet}
            icon={<Printer className="w-4 h-4 text-[#00205B]" />}
          >
            Ficha Institucional PDF
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Los datos institucionales han sido actualizados con éxito en el sistema!
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#00205B] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#E63956]" />
              Identificación Legal y Sede Central
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre de Fantasía"
                value={formData.nombreComercial}
                onChange={(e) => handleChange("nombreComercial", e.target.value)}
                required
              />
              <Input
                label="Razón Social (Asociación)"
                value={formData.razonSocial}
                onChange={(e) => handleChange("razonSocial", e.target.value)}
                required
              />
              <Input
                label="CUIT Institucional"
                value={formData.cuit}
                onChange={(e) => handleChange("cuit", e.target.value)}
                required
              />
              <Input
                label="Directora General / Rectora"
                value={formData.directoraGeneral}
                onChange={(e) => handleChange("directoraGeneral", e.target.value)}
                required
              />
            </div>

            <Input
              label="Dirección de la Sede Central"
              value={formData.sedePrincipal}
              onChange={(e) => handleChange("sedePrincipal", e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Teléfono Fijo"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
              <Input
                label="Email Oficial"
                type="email"
                value={formData.emailOficial}
                onChange={(e) => handleChange("emailOficial", e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Sitio Web Institucional"
                value={formData.sitioWeb}
                onChange={(e) => handleChange("sitioWeb", e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
                required
              />
            </div>

            <div className="pt-2">
              <Input
                label="Resolución Ministerial / Disposición DGCyE"
                value={formData.resolucionMinisterial}
                onChange={(e) => handleChange("resolucionMinisterial", e.target.value)}
                leftIcon={<FileText className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Institutional Agreements Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#00205B] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E63956]" />
              Convenios Internacionales y de Articulación
            </h2>

            <div className="space-y-3">
              {formData.convenios.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{c.nombre}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#00205B]">
                        {c.codigoSede}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">{c.tipo}</div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      {c.descripcion}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    Vigente desde {c.vigenteDesde}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Socials, Crest & Submit */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#00205B]">Logotipo y Emblema</h3>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#00205B] text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-[#E63956] mb-3">
                EIS
              </div>
              <span className="text-xs font-bold text-slate-800">
                EIS Institute Ensenada
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Emblema oficial de certificados y títulos
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#00205B]">Canales de Difusión</h3>
            <Input
              label="Instagram Institucional"
              value={formData.redesSociales.instagram}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  redesSociales: { ...prev.redesSociales, instagram: e.target.value },
                }))
              }
            />
            <Input
              label="Facebook"
              value={formData.redesSociales.facebook}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  redesSociales: { ...prev.redesSociales, facebook: e.target.value },
                }))
              }
            />
            <Input
              label="WhatsApp Secretaría"
              value={formData.redesSociales.whatsapp}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  redesSociales: { ...prev.redesSociales, whatsapp: e.target.value },
                }))
              }
            />
          </div>

          <Button
            type="submit"
            variant="coral"
            size="lg"
            className="w-full font-bold shadow-md shadow-[#E63956]/20"
            icon={<Save className="w-4 h-4" />}
          >
            Guardar Cambios Institucionales
          </Button>
        </div>
      </form>
    </div>
  );
}
