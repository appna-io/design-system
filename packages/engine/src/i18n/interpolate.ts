/**
 * Minimal `{name}`-style template interpolation.
 *
 * Deliberately simple: no escape grammar, no nested braces, no format selectors. If a
 * consumer needs ICU MessageFormat, they should layer a richer i18n library on top — the
 * engine's `interpolate` is here to cover the >95 % case where messages contain only
 * `{paramName}` placeholders. Compare with `react-intl` / `lingui` / `i18next` — all three
 * are >10 KB and we deliberately stay under 2 KB total for the i18n module.
 *
 * Rules:
 *  - `{name}` — replaced with `params.name` coerced to string via `String(value)`.
 *  - Missing param — replaced with the empty string in production. In dev (`NODE_ENV !==
 *    'production'`) the function emits a `console.warn` so the typo is visible.
 *  - Curly braces with anything other than a bareword `[A-Za-z0-9_]+` inside are left as-is.
 *  - `{0}`, `{1}`, … positional params are NOT supported — keep param names readable.
 */
export type InterpolationParams = Record<string, string | number | boolean | null | undefined>;

const TEMPLATE_RE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export function interpolate(template: string, params?: InterpolationParams): string {
  if (!params) return template;
  // Fast-path: no `{` in the string at all.
  if (template.indexOf('{') < 0) return template;
  return template.replace(TEMPLATE_RE, (_match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) {
      // Dev warning helps catch typos like `{namee}` while keeping production silent.
      if (
        typeof process !== 'undefined' &&
        process.env &&
        process.env.NODE_ENV !== 'production'
      ) {
        // console.warn deliberately — throwing here would brick a localized app on first
        // render. The DS-wide convention is "loud warn, soft fallback".
        console.warn(
          `[@apx-ui/engine/i18n] Missing interpolation param "${name}" in template "${template}".`,
        );
      }
      return '';
    }
    const value = params[name];
    if (value === null || value === undefined) return '';
    return String(value);
  });
}