import { Div, Input } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" gap="1.5" className="w-full max-w-sm text-sm text-fg">
      <label htmlFor="basic-email">Email address</label>
      <Input id="basic-email" type="email" placeholder="user@example.com" />
    </Div>
  );
}