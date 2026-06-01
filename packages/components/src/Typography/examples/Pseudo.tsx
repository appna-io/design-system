import { Typography } from '@apx-ui/ds';

export default function Pseudo() {
  return (
    <Typography
      variant="body"
      actLike="a"
      href="/docs"
      onHover="text-primary underline"
      onFocusVisible="outline outline-2 outline-primary"
    >
      Hover or keyboard-focus me — the pseudo hooks are inherited from &lt;Div /&gt; verbatim,
      so Typography opts into the same className-string-per-pseudo-state pattern.
    </Typography>
  );
}