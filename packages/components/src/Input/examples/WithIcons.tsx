import { Mail, Search, X } from 'lucide-react';
import { Input } from 'apx-ds';

export default function WithIcons() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input leftIcon={<Search />} placeholder="Search…" aria-label="Search" />
      <Input
        leftIcon={<Mail />}
        rightIcon={<X />}
        type="email"
        placeholder="user@example.com"
        aria-label="Email with clear icon"
      />
      <Input
        variant="solid"
        leftIcon={<Search />}
        placeholder="Solid + leading icon"
        aria-label="Solid with search icon"
      />
    </div>
  );
}
