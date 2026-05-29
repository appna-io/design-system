import { Slider } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div className="w-72 flex flex-col gap-6">
      <div>
        <div className="text-xs text-fg-muted mb-2">sm</div>
        <Slider aria-label="Small" size="sm" defaultValue={40} />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">md (default)</div>
        <Slider aria-label="Medium" size="md" defaultValue={60} />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">lg</div>
        <Slider aria-label="Large" size="lg" defaultValue={80} />
      </div>
    </div>
  );
}
