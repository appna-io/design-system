import { Textarea } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Textarea size="sm" placeholder="Small" aria-label="Small textarea" />
      <Textarea size="md" placeholder="Medium" aria-label="Medium textarea" />
      <Textarea size="lg" placeholder="Large" aria-label="Large textarea" />
    </div>
  );
}
