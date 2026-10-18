/**
 * EIS Institute - Institutional Export Utilities
 * Simulates and provides real browser CSV/Excel export and institutional print/PDF preview.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | boolean | null | undefined);
}

export function exportToExcelCSV<T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(";");

  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val: unknown;
        if (typeof col.accessor === "function") {
          val = col.accessor(item);
        } else {
          val = item[col.accessor];
        }
        if (val === null || val === undefined) val = "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(";")
  );

  // UTF-8 BOM to ensure Excel opens Spanish characters and accents properly
  const bom = "\uFEFF";
  const csvContent = bom + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openInstitutionalPrintPreview(title: string, htmlBody: string): void {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Por favor permita las ventanas emergentes para la previsualización del documento.");
    return;
  }

  const dateNow = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title} - EIS Institute</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 32px;
            color: #1e293b;
            background: #fff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #00205B;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .crest {
            width: 48px;
            height: 48px;
            background: #00205B;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: 1px;
            border: 2px solid #E63956;
          }
          .brand-name {
            font-size: 20px;
            font-weight: 800;
            color: #00205B;
            line-height: 1.2;
          }
          .brand-sub {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .doc-meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .doc-title {
            font-size: 18px;
            font-weight: 700;
            color: #00205B;
            margin-bottom: 4px;
          }
          .content {
            margin-top: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            font-size: 13px;
          }
          th {
            background-color: #00205B;
            color: white;
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
          }
          td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 48px;
            padding-top: 16px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
            text-align: center;
          }
          .sig-line {
            width: 200px;
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 600;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
          .btn-print {
            background: #00205B;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 8px;">
          <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
          <button class="btn-print" style="background: #64748b;" onclick="window.close()">Cerrar Ventana</button>
        </div>
        <div class="header">
          <div class="brand-logo">
            <div class="crest">EIS</div>
            <div>
              <div class="brand-name">EIS INSTITUTE</div>
              <div class="brand-sub">Cultural Inglesa de Ensenada · Sede La Paz Nº 525</div>
              <div style="font-size: 10px; color: #E63956; font-weight: 600; margin-top: 2px;">
                Convenios Oficiales: Anglia Examinations & UTN
              </div>
            </div>
          </div>
          <div class="doc-meta">
            <div class="doc-title">${title}</div>
            <div>Fecha: ${dateNow}</div>
            <div>CUIT: 30-68421954-8 · Tel: (0221) 469-5201</div>
          </div>
        </div>

        <div class="content">
          ${htmlBody}
        </div>

        <div class="footer">
          <div>Documento Oficial del Sistema Integral de Gestión Académica y Administrativa - EIS Institute</div>
          <div>Página 1 de 1</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}
