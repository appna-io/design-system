import { Div, Typography } from 'apx-ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap={3}>
      <Typography variant="display">Display</Typography>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
      <Typography variant="bodyLarge">Body Large</Typography>
      <Typography variant="body">Body</Typography>
      <Typography variant="bodySmall">Body Small</Typography>
      <Typography variant="caption">Caption</Typography>
      <Typography variant="overline">Overline</Typography>
      <Typography variant="code">code()</Typography>
    </Div>
  );
}
