import { Div, Typography } from '@apx-ui/ds';

export default function Headings() {
  return (
    <Div display="flex" flexDirection="column" gap={2}>
      <Typography variant="h1">Page title (renders as &lt;h1&gt;)</Typography>
      <Typography variant="h2">Section title (renders as &lt;h2&gt;)</Typography>
      <Typography variant="h3">Subsection (renders as &lt;h3&gt;)</Typography>
      <Typography variant="h4">Group label (renders as &lt;h4&gt;)</Typography>
      <Typography variant="h2" as="h1">
        Visually h2, semantically h1 (when document outline needs to win)
      </Typography>
    </Div>
  );
}