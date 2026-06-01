import { Div, Icon, Typography } from '@apx-ui/ds';

import { Loader } from './_glyphs';

export default function Spin() {
  return (
    <Div display="flex" gap="4" alignItems="center">
      <Icon as={Loader} spin label="Loading" />
      <Icon as={Loader} spin size="lg" color="accent" label="Loading large" />
      <Typography as="span" variant="caption" color="fg.muted">
        Respects <code>prefers-reduced-motion</code>.
      </Typography>
    </Div>
  );
}