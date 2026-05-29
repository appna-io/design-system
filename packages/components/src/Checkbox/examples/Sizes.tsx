import { Checkbox } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox size="sm" defaultChecked>
        Small
      </Checkbox>
      <Checkbox size="md" defaultChecked>
        Medium
      </Checkbox>
      <Checkbox size="lg" defaultChecked>
        Large
      </Checkbox>
    </div>
  );
}
