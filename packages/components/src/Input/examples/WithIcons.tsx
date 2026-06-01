import { Mail, Search, X } from 'lucide-react';
import { Div, Input } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
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
    </Div>
  );
}