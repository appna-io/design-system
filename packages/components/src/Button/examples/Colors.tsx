import { Button } from '@apx-ui/ds';

export default function Colors() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
      <Button color="info">Info</Button>
      <Button color="neutral">Neutral</Button>
    </div>
  );
}
