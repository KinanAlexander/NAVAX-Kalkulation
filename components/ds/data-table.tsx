import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

/* ── Column definition ── */
export interface DataTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  align?: "left" | "center" | "right"
  render?: (row: T) => React.ReactNode
}

/* ── Props ── */
interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<T>[]
  data: T[]
  onSort?: (key: string, direction: "asc" | "desc") => void
  sortKey?: string
  sortDir?: "asc" | "desc"
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  className,
  columns,
  data,
  onSort,
  sortKey,
  sortDir,
  emptyMessage = "No results found.",
  ...props
}: DataTableProps<T>) {
  const alignClass = (a?: "left" | "center" | "right") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left"

  return (
    <div
      className={cn("w-full overflow-auto rounded-lg border border-border", className)}
      {...props}
    >
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-10 px-4 font-medium text-muted-foreground",
                  alignClass(col.align),
                  col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors"
                )}
                onClick={() => {
                  if (col.sortable && onSort) {
                    const next = sortKey === col.key && sortDir === "asc" ? "desc" : "asc"
                    onSort(col.key, next)
                  }
                }}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortDir === "asc"
                      ? <ChevronUp className="size-3.5" />
                      : <ChevronDown className="size-3.5" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3", alignClass(col.align))}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
