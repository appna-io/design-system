import type { ChangeEvent } from 'react';

/**
 * Pure: extracts the right value from a native form-element change event. Mirrors what Formik
 * does in `handleChange`, factored out so `useForm` can stay focused on state transitions.
 *
 *  - `<input type="checkbox">` → `event.target.checked` (boolean).
 *  - `<input type="number">` / `<input type="range">` → `Number(value)` (or `''` for empty).
 *  - `<input type="file">` → `event.target.files` (`FileList | null`).
 *  - `<select multiple>` → `string[]` of selected option values.
 *  - everything else → `event.target.value` (string).
 *
 * Returns `undefined` if the event target doesn't expose a known input shape; callers can
 * `?? prevValue` to keep state intact.
 */
export function parseEventValue(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
): unknown {
  const target = event.target as
    | (HTMLInputElement & { type: string; checked?: boolean; files?: FileList | null })
    | HTMLTextAreaElement
    | HTMLSelectElement;

  if (target instanceof HTMLInputElement) {
    const type = target.type;
    if (type === 'checkbox') return target.checked;
    if (type === 'number' || type === 'range') {
      const v = target.value;
      if (v === '') return '';
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    }
    if (type === 'file') return target.files;
    return target.value;
  }

  if (target instanceof HTMLSelectElement && target.multiple) {
    return Array.from(target.selectedOptions).map((opt) => opt.value);
  }

  return (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
}
