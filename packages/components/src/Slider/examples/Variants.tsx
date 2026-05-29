import { Slider } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="w-72 flex flex-col gap-6">
      <div>
        <div className="text-xs text-fg-muted mb-2">solid (default)</div>
        <Slider aria-label="Solid" variant="solid" defaultValue={60} />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">outline</div>
        <Slider aria-label="Outline" variant="outline" defaultValue={60} />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">soft</div>
        <Slider aria-label="Soft" variant="soft" defaultValue={60} />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">minimal</div>
        <Slider aria-label="Minimal" variant="minimal" defaultValue={60} />
      </div>
    </div>
  );
}
