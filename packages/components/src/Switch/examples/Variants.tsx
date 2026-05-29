import { Switch } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-3">
      <Switch variant="solid" defaultChecked>
        Solid (default)
      </Switch>
      <Switch variant="outline" defaultChecked>
        Outline
      </Switch>
      <Switch variant="soft" defaultChecked>
        Soft
      </Switch>
    </div>
  );
}
