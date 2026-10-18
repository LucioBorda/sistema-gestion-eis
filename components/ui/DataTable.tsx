"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FileSpreadsheet,
  Printer,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  FolderOpen,
} from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  onAddNew?: () => void;
  addNewLabel?: string;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customRowActions?: (item: T) => React.ReactNode;
  extraHeaderActions?: React.ReactNode;
  extraFilters?: React.ReactNode;
  initialPageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = "Buscar en tiempo real...",
  searchFilter,
  onAddNew,
  addNewLabel = "Nuevo Registro",
  onExportExcel,
  onExportPdf,
  onView,
  onEdit,
  onDelete,
  customRowActions,
  extraHeaderActions,
  extraFilters,
  initialPageSize = 8,
  isLoading = false,
  emptyMessage = "No se encontraron registros que coincidan con la búsqueda.",
}: DataTableProps<T>): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();

    if (searchFilter) {
      return data.filter((item) => searchFilter(item, query));
    }

    // Default search across all string/number fields of item
    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const column = columns.find((c) => c.id === sortColumn);
    if (!column || !column.accessorKey) return filteredData;

    const key = column.accessorKey;

    return [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const hasActions = Boolean(onView || onEdit || onDelete || customRowActions);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-[#00205B] tracking-tight flex items-center gap-2">
                {title}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {totalItems} total
                </span>
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {extraHeaderActions}

            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                className="hover:border-emerald-600 hover:text-emerald-700"
              >
                Excel
              </Button>
            )}

            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPdf}
                icon={<Printer className="w-4 h-4 text-[#00205B]" />}
              >
                Imprimir / PDF
              </Button>
            )}

            {onAddNew && (
              <Button
                variant="coral"
                size="sm"
                onClick={onAddNew}
                icon={<Plus className="w-4 h-4" />}
                className="shadow-sm shadow-[#E63956]/20 font-semibold"
              >
                {addNewLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Search & Extra Filters row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00205B] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 rounded-full px-1.5 py-0.5"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {extraFilters}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00205B]"
              >
                <option value={5}>5 por pág.</option>
                <option value={8}>8 por pág.</option>
                <option value={10}>10 por pág.</option>
                <option value={20}>20 por pág.</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
              {columns.map((col) => (
                <th
                  key={col.id}
                  onClick={() => handleSort(col.id, col.sortable)}
                  className={cn(
                    "py-3.5 px-4 transition-colors",
                    col.sortable && "cursor-pointer hover:bg-slate-100 hover:text-[#00205B]",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.className
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      col.align === "center" && "justify-center",
                      col.align === "right" && "justify-end"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown
                        className={cn(
                          "w-3 h-3 text-slate-400",
                          sortColumn === col.id && "text-[#00205B] font-bold"
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="py-3.5 px-4 text-center font-bold">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-[#00205B] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Cargando registros...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <FolderOpen className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Sin resultados</p>
                    <p className="text-xs text-slate-500 mt-1">{emptyMessage}</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-xs text-[#00205B] font-semibold hover:underline"
                      >
                        Limpiar filtro de búsqueda
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const rowKey = keyExtractor(item);
                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "py-3.5 px-4 text-slate-700",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String(item[col.accessorKey] ?? "-")
                          : null}
                      </td>
                    ))}

                    {hasActions && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              title="Ver Detalle"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#00205B] hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              title="Eliminar"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {customRowActions && customRowActions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Mostrando{" "}
          <span className="font-semibold text-slate-700">
            {totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}
          </span>{" "}
          a{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(validCurrentPage * pageSize, totalItems)}
          </span>{" "}
          de <span className="font-semibold text-slate-700">{totalItems}</span> registros
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage <= 1}
            icon={<ChevronLeft className="w-4 h-4" />}
            className="px-2"
          >
            Anterior
          </Button>

          <div className="flex items-center gap-1 px-2 font-medium text-slate-700">
            Página {validCurrentPage} de {totalPages}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage >= totalPages}
            icon={<ChevronRight className="w-4 h-4" />}
            className="px-2"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
