import { Div, Textarea } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-md">
      <Textarea size="sm" placeholder="Small" aria-label="Small textarea" />
      <Textarea size="md" placeholder="Medium" aria-label="Medium textarea" />
      <Textarea size="lg" placeholder="Large" aria-label="Large textarea" />
    </Div>
  );
}