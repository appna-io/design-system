import { Switch } from '@apx-ui/ds';

export default function Shapes() {
  return (
    <div className="flex flex-col gap-3">
      <Switch shape="pill" defaultChecked>
        Pill (default)
      </Switch>
      <Switch shape="square" defaultChecked>
        Square
      </Switch>
    </div>
  );
}
