import { extractProps } from '../../lib/propsTable';

interface PropsTableProps {
  sourcePath: string;
}

export async function PropsTable({ sourcePath }: PropsTableProps) {
  const doc = await extractProps(sourcePath);

  if (!doc || doc.rows.length === 0) {
    return (
      <p className="text-sm text-fg-muted">
        No documented props found. Add JSDoc to the component&apos;s prop interface to populate this
        table.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-bg-paper">
          <tr className="text-start">
            <th className="border-b border-border px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Prop
            </th>
            <th className="border-b border-border px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Type
            </th>
            <th className="border-b border-border px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Default
            </th>
            <th className="border-b border-border px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="border-b border-border px-3 py-2 font-mono text-xs">
                <span className="text-fg">{row.name}</span>
                {row.required && <span className="ms-1 text-danger">*</span>}
                {row.deprecated && (
                  <span className="ms-2 inline-block rounded bg-danger-subtle px-1.5 text-[10px] font-semibold uppercase text-danger">
                    deprecated
                  </span>
                )}
                {row.experimental && (
                  <span className="ms-2 inline-block rounded bg-warning-subtle px-1.5 text-[10px] font-semibold uppercase text-warning">
                    experimental
                  </span>
                )}
              </td>
              <td className="border-b border-border px-3 py-2 font-mono text-xs text-fg-muted">
                {row.type}
              </td>
              <td className="border-b border-border px-3 py-2 font-mono text-xs text-fg-muted">
                {row.defaultValue ?? '—'}
              </td>
              <td className="border-b border-border px-3 py-2 text-sm text-fg">
                {row.description || <span className="text-fg-muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
