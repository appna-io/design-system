import { Switch } from 'apx-ds';

export default function Disabled() {
  return (
    <div className="flex flex-col gap-2">
      <Switch disabled>Disabled, off</Switch>
      <Switch disabled defaultChecked>
        Disabled, on
      </Switch>
    </div>
  );
}
