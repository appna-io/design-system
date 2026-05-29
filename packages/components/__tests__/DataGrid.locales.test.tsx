import { I18nProvider } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataGrid } from '../src/DataGrid';
import type {
  ColumnDef,
  DataGridOperatorTranslations,
  DataGridTranslations,
} from '../src/DataGrid';
import {
  arDataGridTranslations,
  enDataGridTranslations,
  heDataGridTranslations,
  mergeTranslations,
} from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

/* --------------------------------------------------------------------------
 *  PR 7 — Hebrew + Arabic locale bundles
 *
 *  Three layers:
 *    1. Structural parity — every locale fills the same key surface so a
 *       consumer can swap bundles without falling back to English mid-grid.
 *    2. Rendering — when a bundle is wired via the `translations` prop or via
 *       `<I18nProvider messages={{ DataGrid: … }}>`, the rendered chrome
 *       reflects the supplied strings.
 *    3. Merging — `mergeTranslations` layers default → provider → props so
 *       partial overrides slot in without re-supplying the whole catalogue.
 * -------------------------------------------------------------------------- */

interface Row {
  id: number;
  name: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'Maya', signups: 12 },
  { id: 2, name: 'Liam', signups: 4 },
];

const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

/* -------------------------------------------------------------------------- */
/*  Structural parity                                                          */
/* -------------------------------------------------------------------------- */

function topLevelKeys(t: DataGridTranslations): string[] {
  return Object.keys(t).sort();
}

function operatorKeys(t: DataGridTranslations): string[] {
  return Object.keys(t.operators).sort();
}

describe('DataGrid — locale bundle parity', () => {
  it('he bundle exposes the same top-level keys as en', () => {
    expect(topLevelKeys(heDataGridTranslations)).toEqual(topLevelKeys(enDataGridTranslations));
  });

  it('ar bundle exposes the same top-level keys as en', () => {
    expect(topLevelKeys(arDataGridTranslations)).toEqual(topLevelKeys(enDataGridTranslations));
  });

  it('he bundle exposes the same operator keys as en', () => {
    expect(operatorKeys(heDataGridTranslations)).toEqual(operatorKeys(enDataGridTranslations));
  });

  it('ar bundle exposes the same operator keys as en', () => {
    expect(operatorKeys(arDataGridTranslations)).toEqual(operatorKeys(enDataGridTranslations));
  });

  // Each scalar key should be a non-empty string; each function key should
  // return a non-empty string for representative inputs. Catches future bundle
  // edits that accidentally leave a key empty / undefined.
  it('every scalar string in every locale is non-empty', () => {
    for (const bundle of [enDataGridTranslations, heDataGridTranslations, arDataGridTranslations]) {
      for (const [key, value] of Object.entries(bundle)) {
        if (typeof value === 'string') {
          expect(value, `${key} should be non-empty`).toMatch(/\S/);
        }
      }
      for (const [op, value] of Object.entries(bundle.operators)) {
        expect(value, `operators.${op} should be non-empty`).toMatch(/\S/);
      }
    }
  });

  it('every formatter in every locale produces a non-empty string', () => {
    for (const bundle of [enDataGridTranslations, heDataGridTranslations, arDataGridTranslations]) {
      expect(bundle.sortIndex(2)).toMatch(/\S/);
      expect(bundle.filterColumn('Name')).toMatch(/\S/);
      expect(bundle.filterActiveCount(3)).toMatch(/\S/);
      expect(bundle.paginationOfTotal(1, 10, 42)).toMatch(/\S/);
      expect(bundle.paginationPageOfPages(1, 5)).toMatch(/\S/);
      expect(bundle.selectionSummary(2, 10)).toMatch(/\S/);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Sanity — formatters embed numbers correctly                                */
/* -------------------------------------------------------------------------- */

describe('DataGrid — locale formatters', () => {
  it('he paginationOfTotal interleaves numbers + Hebrew connective', () => {
    expect(heDataGridTranslations.paginationOfTotal(1, 10, 42)).toBe('1–10 מתוך 42');
  });

  it('ar paginationOfTotal interleaves numbers + Arabic connective', () => {
    expect(arDataGridTranslations.paginationOfTotal(1, 10, 42)).toBe('1–10 من 42');
  });

  it('he paginationPageOfPages formats with עמוד … מתוך …', () => {
    expect(heDataGridTranslations.paginationPageOfPages(3, 7)).toBe('עמוד 3 מתוך 7');
  });

  it('ar selectionSummary formats with … من … محددة', () => {
    expect(arDataGridTranslations.selectionSummary(2, 10)).toBe('2 من 10 محددة');
  });
});

/* -------------------------------------------------------------------------- */
/*  Rendering — props layer                                                    */
/* -------------------------------------------------------------------------- */

describe('DataGrid — translations prop wires through the rendered tree', () => {
  it('renders the Hebrew select-all checkbox label when he bundle is supplied', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        translations={heDataGridTranslations}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: heDataGridTranslations.selectAllRows });
    expect(checkbox).toBeInTheDocument();
  });

  it('renders the Arabic select-all checkbox label when ar bundle is supplied', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        translations={arDataGridTranslations}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: arDataGridTranslations.selectAllRows });
    expect(checkbox).toBeInTheDocument();
  });

  it('renders the Hebrew empty state when data is empty + he bundle is supplied', () => {
    render(
      <DataGrid<Row>
        data={[]}
        columns={columns}
        getRowId={(r) => r.id}
        translations={heDataGridTranslations}
      />,
    );
    expect(screen.getByText(heDataGridTranslations.empty)).toBeInTheDocument();
    expect(screen.getByText(heDataGridTranslations.emptyDescription)).toBeInTheDocument();
  });

  it('renders the Arabic empty state when data is empty + ar bundle is supplied', () => {
    render(
      <DataGrid<Row>
        data={[]}
        columns={columns}
        getRowId={(r) => r.id}
        translations={arDataGridTranslations}
      />,
    );
    expect(screen.getByText(arDataGridTranslations.empty)).toBeInTheDocument();
    expect(screen.getByText(arDataGridTranslations.emptyDescription)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Rendering — I18nProvider layer                                             */
/* -------------------------------------------------------------------------- */

describe('DataGrid — I18nProvider context wires through the rendered tree', () => {
  it('reads the DataGrid namespace from <I18nProvider> when no props override', () => {
    render(
      <I18nProvider
        locale="he"
        direction="rtl"
        messages={{ DataGrid: heDataGridTranslations }}
      >
        <DataGrid<Row>
          data={[]}
          columns={columns}
          getRowId={(r) => r.id}
        />
      </I18nProvider>,
    );
    expect(screen.getByText(heDataGridTranslations.empty)).toBeInTheDocument();
  });

  it('props layer wins over <I18nProvider> messages', () => {
    const overrides: Partial<DataGridTranslations> = {
      empty: 'No rows here',
    };
    render(
      <I18nProvider
        locale="he"
        direction="rtl"
        messages={{ DataGrid: heDataGridTranslations }}
      >
        <DataGrid<Row>
          data={[]}
          columns={columns}
          getRowId={(r) => r.id}
          translations={overrides}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('No rows here')).toBeInTheDocument();
    // Description still comes from the Hebrew bundle since props didn't touch it.
    expect(screen.getByText(heDataGridTranslations.emptyDescription)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  mergeTranslations — pure layering                                          */
/* -------------------------------------------------------------------------- */

describe('mergeTranslations', () => {
  it('returns the defaults when both provider + props layers are absent', () => {
    expect(mergeTranslations(enDataGridTranslations, undefined, undefined)).toEqual(
      enDataGridTranslations,
    );
  });

  it('provider layer overrides defaults', () => {
    const merged = mergeTranslations(
      enDataGridTranslations,
      { empty: 'Nada' },
      undefined,
    );
    expect(merged.empty).toBe('Nada');
    expect(merged.emptyDescription).toBe(enDataGridTranslations.emptyDescription);
  });

  it('props layer overrides provider layer', () => {
    const merged = mergeTranslations(
      enDataGridTranslations,
      { empty: 'Nada' },
      { empty: 'Zilch' },
    );
    expect(merged.empty).toBe('Zilch');
  });

  it('deep-merges the operators namespace independently per layer', () => {
    const partialOps: Partial<DataGridOperatorTranslations> = { equals: '=' };
    const merged = mergeTranslations(
      enDataGridTranslations,
      undefined,
      { operators: partialOps as DataGridOperatorTranslations },
    );
    expect(merged.operators.equals).toBe('=');
    expect(merged.operators.notEquals).toBe(enDataGridTranslations.operators.notEquals);
  });
});
