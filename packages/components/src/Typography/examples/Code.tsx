import { Typography } from '@apx-ui/ds';

export default function Code() {
  return (
    <Typography variant="body">
      Render inline code with <Typography variant="code">const x = 42;</Typography> inside a
      sentence — the <Typography variant="code">code</Typography> variant renders as the
      semantic &lt;code&gt; element with the mono font, a subtle background, and tight padding.
    </Typography>
  );
}
