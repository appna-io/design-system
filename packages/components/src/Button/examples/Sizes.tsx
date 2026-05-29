import { Button } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size={{ base: 'sm', md: 'lg' }}>Responsive (sm → lg @ md)</Button>
    </div>
  );
}
