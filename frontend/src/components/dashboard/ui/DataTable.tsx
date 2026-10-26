import styles from './DataTable.module.css';

/** Una celda de cabecera con su clave y etiqueta. */
export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Renderizador personalizado para la celda. Si se omite se usa el valor directo. */
  render?: (row: T, index: number) => React.ReactNode;
  /** Ancho CSS opcional, p.ej. "120px" o "10%" */
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: keyof T;
  emptyMessage?: string;
  /** Cabecera opcional encima de la tabla (título + conteo + acciones) */
  header?: React.ReactNode;
  id?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  keyField,
  emptyMessage = 'No hay registros para mostrar.',
  header,
  id,
}: DataTableProps<T>) {
  return (
    <section className={styles.tableSection} id={id}>
      {header && <div className={styles.sectionHeader}>{header}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={styles.emptyState}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={String(row[keyField])}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(row, index)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
