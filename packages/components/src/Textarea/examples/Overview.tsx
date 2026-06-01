import { Div, Textarea, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography as="label" htmlFor="overview-empty" variant="bodySmall" color="fg.default">
          Empty with placeholder
        </Typography>
        <Textarea id="overview-empty" placeholder="Tell us about yourself…" />
      </Div>

      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography as="label" htmlFor="overview-filled" variant="bodySmall" color="fg.default">
          With content
        </Typography>
        <Textarea
          id="overview-filled"
          defaultValue="Senior product designer with 8 years building design systems and data-heavy dashboards."
          rows={3}
        />
      </Div>

      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography as="label" htmlFor="overview-count" variant="bodySmall" color="fg.default">
          Character count + error
        </Typography>
        <Textarea
          id="overview-count"
          defaultValue="Too short"
          invalid
          showCount
          maxLength={120}
          aria-describedby="overview-count-error"
          rows={3}
        />
        <Typography id="overview-count-error" variant="caption" color="danger">
          Bio must be at least 10 characters.
        </Typography>
      </Div>
    </Div>
  );
}