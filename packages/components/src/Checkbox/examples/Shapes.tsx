import { Checkbox } from 'apx-ds';

export default function Shapes() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox shape="square" defaultChecked>
        Square (default)
      </Checkbox>
      <Checkbox shape="rounded" defaultChecked>
        Rounded
      </Checkbox>
      <Checkbox shape="circle" defaultChecked>
        Circle
      </Checkbox>
    </div>
  );
}
