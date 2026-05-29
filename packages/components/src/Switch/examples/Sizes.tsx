import { Switch } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <Switch size="sm" defaultChecked>
        Small
      </Switch>
      <Switch size="md" defaultChecked>
        Medium
      </Switch>
      <Switch size="lg" defaultChecked>
        Large
      </Switch>
    </div>
  );
}
