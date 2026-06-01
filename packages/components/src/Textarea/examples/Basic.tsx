import { Div, Textarea } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" gap="1.5" className="w-full max-w-md text-sm text-fg">
      <label htmlFor="basic-bio">Tell us about yourself</label>
      <Textarea id="basic-bio" placeholder="A few sentences will do…" />
    </Div>
  );
}