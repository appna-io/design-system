import type { ComputePageWindowOptions, PageItem } from './Pagination.types';

/**
 * Build the rendered list of page-number buttons + ellipsis sentinels for the
 * current page.
 *
 * Algorithm: matches **MUI's `usePagination`** verbatim — a sliding window of
 * constant length (`2 * siblingCount + 1`) that shifts toward whichever
 * boundary the current page is closest to. This is the industry-standard
 * behavior consumers coming from MUI / TanStack / shadcn already expect.
 *
 * Key properties:
 *   - The current page is always present.
 *   - The first `boundaryCount` and last `boundaryCount` pages are always
 *     present (when `pageCount` permits).
 *   - Ellipses are split into `ellipsis-start` and `ellipsis-end` so future
 *     "jump back / forward" interactions can distinguish them.
 *   - A gap of exactly one hidden page is replaced with that page number
 *     instead of an ellipsis (avoids the `1 … 3 4 5` anti-pattern).
 *   - Numeric items are **1-based** (the label the user sees).
 *
 * The plan's reference table in `27-data-grid.md` was sketched; the formal
 * contract is the cases below (covered by `Pagination.compute.test.ts`).
 */
export function computePageWindow(options: ComputePageWindowOptions): PageItem[] {
  const { pageIndex, pageCount } = options;
  const siblingCount = Math.max(0, options.siblingCount ?? 1);
  const boundaryCount = Math.max(0, options.boundaryCount ?? 1);

  if (pageCount <= 0) return [];
  if (pageCount === 1) return [1];

  // Clamp the active page into the legal range and convert to 1-based.
  const page = Math.min(Math.max(pageIndex, 0), pageCount - 1) + 1;

  const startPages = range(1, Math.min(boundaryCount, pageCount));
  const endPages = range(
    Math.max(pageCount - boundaryCount + 1, boundaryCount + 1),
    pageCount,
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? (endPages[0]! - 2) : pageCount - 1,
  );

  const out: PageItem[] = [];

  // Start boundary
  for (const p of startPages) out.push(p);

  // Gap between start boundary and middle siblings
  if (siblingsStart > boundaryCount + 2) {
    out.push('ellipsis-start');
  } else if (boundaryCount + 1 < pageCount - boundaryCount) {
    // Gap of exactly one page — render the page itself instead of an ellipsis.
    out.push(boundaryCount + 1);
  }

  // Middle window
  for (const p of range(siblingsStart, siblingsEnd)) out.push(p);

  // Gap between middle siblings and end boundary
  if (siblingsEnd < pageCount - boundaryCount - 1) {
    out.push('ellipsis-end');
  } else if (pageCount - boundaryCount > boundaryCount) {
    out.push(pageCount - boundaryCount);
  }

  // End boundary
  for (const p of endPages) out.push(p);

  // De-duplicate adjacent equal numbers — happens when the window overlaps the
  // boundary range (large `boundaryCount` + small `pageCount`).
  const dedup: PageItem[] = [];
  for (const item of out) {
    if (dedup[dedup.length - 1] !== item) dedup.push(item);
  }
  return dedup;
}

function range(from: number, to: number): number[] {
  if (to < from) return [];
  const out: number[] = new Array(to - from + 1);
  for (let i = 0; i < out.length; i++) out[i] = from + i;
  return out;
}
