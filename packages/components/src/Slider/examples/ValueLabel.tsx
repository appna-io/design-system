import { Slider } from '@apx-ui/ds';

export default function ValueLabel() {
  return (
    <div className="w-72 flex flex-col gap-8 pt-10">
      <div>
        <div className="text-xs text-fg-muted mb-2">showValueLabel = always</div>
        <Slider aria-label="Always" defaultValue={30} showValueLabel="always" />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">showValueLabel = hover</div>
        <Slider aria-label="Hover" defaultValue={55} showValueLabel="hover" />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">showValueLabel = focus</div>
        <Slider aria-label="Focus" defaultValue={80} showValueLabel="focus" />
      </div>
    </div>
  );
}
