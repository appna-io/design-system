import { Div, Input } from '@apx-ui/ds';

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
      <Input color="primary" placeholder="Primary focus ring" aria-label="Primary" />
      <Input color="secondary" placeholder="Secondary" aria-label="Secondary" />
      <Input color="success" placeholder="Success" aria-label="Success" />
      <Input color="warning" placeholder="Warning" aria-label="Warning" />
      <Input color="danger" placeholder="Danger" aria-label="Danger" />
      <Input color="info" placeholder="Info" aria-label="Info" />
      <Input color="neutral" placeholder="Neutral" aria-label="Neutral" />
    </Div>
  );
}