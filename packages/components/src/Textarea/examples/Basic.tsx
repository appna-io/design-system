import { Textarea } from '@apx-ui/ds';

export default function Basic() {
  return (
    <div className="flex w-full max-w-md flex-col gap-1.5 text-sm text-fg">
      <label htmlFor="basic-bio">Tell us about yourself</label>
      <Textarea id="basic-bio" placeholder="A few sentences will do…" />
    </div>
  );
}
