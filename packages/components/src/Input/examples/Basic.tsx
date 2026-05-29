import { Input } from 'apx-ds';

export default function Basic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5 text-sm text-fg">
      <label htmlFor="basic-email">Email address</label>
      <Input id="basic-email" type="email" placeholder="user@example.com" />
    </div>
  );
}
