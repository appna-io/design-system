import { Div, Input } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
      <Input size="sm" placeholder="Small" aria-label="Small input" />
      <Input size="md" placeholder="Medium" aria-label="Medium input" />
      <Input size="lg" placeholder="Large" aria-label="Large input" />
      <Input
        size={{ base: 'sm', md: 'lg' }}
        placeholder="Responsive (sm → lg @ md)"
        aria-label="Responsive input"
      />
    </Div>
  );
}