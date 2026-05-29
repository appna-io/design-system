import { Checkbox } from 'apx-ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox variant="solid" defaultChecked>
        Solid (default)
      </Checkbox>
      <Checkbox variant="outline" defaultChecked>
        Outline
      </Checkbox>
      <Checkbox variant="soft" defaultChecked>
        Soft
      </Checkbox>
    </div>
  );
}
