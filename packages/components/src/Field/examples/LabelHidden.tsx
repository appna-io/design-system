import { Div, Field, Input, Typography } from '@apx-ui/ds';

export default function LabelHidden() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field label="Search" labelPosition="hidden">
        <Input
          type="search"
          name="search"
          placeholder="Search… (label is sr-only)"
          leftIcon={<SearchGlyph />}
        />
      </Field>
      <Typography variant="caption" color="fg.muted">
        Inspect the DOM — the &lt;label&gt; element is still present (visually hidden via `sr-only`),
        so screen-reader users hear &quot;Search&quot; before the input.
      </Typography>
    </Div>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}