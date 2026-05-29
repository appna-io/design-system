import { ArrowRight, Mail, Trash2 } from 'lucide-react';
import { Button } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button leftIcon={<Mail />}>Email me</Button>
      <Button rightIcon={<ArrowRight />}>Continue</Button>
      <Button color="danger" leftIcon={<Trash2 />}>
        Delete
      </Button>
      <Button aria-label="Delete item" color="danger" leftIcon={<Trash2 />} />
    </div>
  );
}
