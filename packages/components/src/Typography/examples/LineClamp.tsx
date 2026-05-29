import { Div, Typography } from 'apx-ds';

export default function LineClamp() {
  return (
    <Div maxWidth={360}>
      <Typography lineClamp={3}>
        Multi-line clamps are great for card descriptions: a generous preview of the underlying
        content that always occupies the same vertical space regardless of source length. Once
        the third line would overflow, the rest gets cut and an ellipsis lands at the end of
        the visible block. Works across Chrome, Safari, and Firefox via the -webkit- flex box
        clamp combo.
      </Typography>
    </Div>
  );
}
