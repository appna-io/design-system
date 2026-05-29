'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { Download } from 'lucide-react';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Button } from '../../Button/Button';
import { Menu } from '../../Menu';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridExportProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * Filename (without extension) used by the default CSV / JSON download. @default 'data'
   */
  filename?: string;
  /**
   * Pre/post hooks — called with the produced string so consumers can ship it to a
   * server, append a BOM, or open a Web Share dialog instead of the default download.
   * Default behaviour: trigger a browser download via a `Blob` + anchor click.
   */
  onCsvExport?: (csv: string) => void;
  onJsonExport?: (json: string) => void;
  sx?: Sx;
}

function triggerDownload(filename: string, mimeType: string, text: string): void {
  if (typeof document === 'undefined') return;
  // jsdom (used by Vitest) doesn't ship `URL.createObjectURL`. Skip the download in
  // that environment so unit tests don't crash; consumers running in a real browser
  // get the file every time.
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * `<DataGrid.Export>` — toolbar `<Menu>` with "Export as CSV" and "Export as JSON"
 * entries. The serialisers run via `grid.exportCsv()` / `grid.exportJson()` and the
 * default behaviour is to trigger a browser download; consumers wanting custom
 * handling pass `onCsvExport` / `onJsonExport` to short-circuit the download.
 */
function DataGridExportImpl(
  props: DataGridExportProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    className,
    sx: _sx,
    style,
    filename = 'data',
    onCsvExport,
    onJsonExport,
    ...rest
  } = props;
  const ctx = useDataGridContext();
  const { grid } = ctx;
  const t = grid.t;

  const handleCsv = (): void => {
    const csv = grid.exportCsv();
    if (onCsvExport) {
      onCsvExport(csv);
      return;
    }
    triggerDownload(`${filename}.csv`, 'text/csv', csv);
  };

  const handleJson = (): void => {
    const json = grid.exportJson();
    if (onJsonExport) {
      onJsonExport(json);
      return;
    }
    triggerDownload(`${filename}.json`, 'application/json', json);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-datagrid-export=""
      {...rest}
    >
      <Menu>
        <Menu.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            color="neutral"
            leftIcon={<Download aria-hidden className="size-4" />}
          >
            {t.exportLabel}
          </Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={handleCsv}>{t.exportCsv}</Menu.Item>
          <Menu.Item onSelect={handleJson}>{t.exportJson}</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  );
}

export const DataGridExport = forwardRef(DataGridExportImpl, 'DataGrid.Export') as (
  props: DataGridExportProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
