import { Input } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small input" />
      <Input size="md" placeholder="Medium" aria-label="Medium input" />
      <Input size="lg" placeholder="Large" aria-label="Large input" />
      <Input
        size={{ base: 'sm', md: 'lg' }}
        placeholder="Responsive (sm → lg @ md)"
        aria-label="Responsive input"
      />
    </div>
  );
}
