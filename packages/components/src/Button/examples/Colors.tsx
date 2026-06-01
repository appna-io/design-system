import { Button, Div } from '@apx-ui/ds';

export default function Colors() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
      <Button color="info">Info</Button>
      <Button color="neutral">Neutral</Button>
    </Div>
  );
}