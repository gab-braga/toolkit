"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    title?: string;
    exportable?: boolean;
    exportValue?: (row: TData, value: TValue) => unknown;
  }
}

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

type SortDirection = "asc" | "desc" | "default" | string;
type FilterValue = "all" | string;

/**
 * Cria uma tabela TanStack com filtros, ordenação, paginação e dados de exportação.
 * @param props Dados e definições de colunas; mantenha suas referências estáveis
 * (por exemplo, com useMemo) em componentes cliente.
 * @returns Instância table, resumo pagination e funções para consultar linhas,
 * filtrar, ordenar e exportar. A exportação inclui todas as linhas filtradas,
 * antes da paginação, e colunas visíveis com meta.title e exportable !== false.
 * @example
 * const data = useMemo(() => [{ name: "Ana" }], []);
 * const columns = useMemo<ColumnDef<{ name: string }>[]>(() => [
 *   { accessorKey: "name", meta: { title: "Nome" } },
 * ], []);
 * const { getRows, getExportData } = useTable({ data, columns });
 * const { headers, rows } = getExportData();
 */

export function useTable<T>({ data, columns }: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const visibleRows = table.getRowModel().rows.length;
  const firstRow = visibleRows > 0 ? pageIndex * pageSize + 1 : 0;
  const lastRow = visibleRows > 0 ? firstRow + visibleRows - 1 : 0;
  const pagination = { totalRows, visibleRows, firstRow, lastRow };

  function getRows() {
    return table.getRowModel().rows;
  }

  function getFilter(column: string) {
    const filter = table.getColumn(column)?.getFilterValue();
    return (filter as string) ?? "";
  }

  function getSorting(column: string): SortDirection {
    const value = sorting.find(({ id }) => id == column)?.desc;
    return value === undefined ? "default" : value ? "desc" : "asc";
  }

  function applyFilter(column: string, value: FilterValue) {
    if (value === "all") table.getColumn(column)?.setFilterValue("");
    else table.getColumn(column)?.setFilterValue(value);
  }

  function applySorting(column: string, value: SortDirection) {
    if (!["default", "desc", "asc"].includes(value)) return;

    if (value === "default") {
      setSorting((prev) => prev.filter((sort) => sort.id !== column));
    } else {
      setSorting((prev) => [
        ...prev.filter((sort) => sort.id !== column),
        { id: column, desc: value === "desc" },
      ]);
    }
  }

  function clearFilters() {
    table.resetColumnFilters();
  }

  function getVisibleExportColumns() {
    return table.getVisibleLeafColumns().filter((column) => {
      const meta = column.columnDef.meta;
      return Boolean(meta?.title && meta.exportable !== false);
    });
  }

  function getExportData() {
    const columns = getVisibleExportColumns();
    const headers = columns.map((column) => column.columnDef.meta?.title ?? "");
    const rows = table.getPrePaginationRowModel().rows.map((row) =>
      columns.map((column) => {
        const exportValue = column.columnDef.meta?.exportValue;
        return exportValue
          ? exportValue(row.original, row.getValue(column.id))
          : row.getValue(column.id);
      }),
    );

    return { headers, rows };
  }

  return {
    table,
    pagination,
    getRows,
    getSorting,
    getFilter,
    applySorting,
    applyFilter,
    clearFilters,
    getExportData,
    getVisibleExportColumns,
  };
}
