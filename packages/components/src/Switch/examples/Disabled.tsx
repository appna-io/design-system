import { Switch } from '@apx-ui/ds';

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
