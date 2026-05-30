import { Avatar, Div } from '@apx-ui/ds';

export default function Fallback() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Avatar name="Ada Lovelace" label="initials" />
      <Avatar
        src="https://example.invalid/missing.png"
        name="Bren Park"
        delayMs={0}
        label="broken image → initials"
      />
      <Avatar label="no name → icon" />
    </Div>
  );
}
