import { Div, Switch } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Switch variant="solid" defaultChecked>
        Solid (default)
      </Switch>
      <Switch variant="outline" defaultChecked>
        Outline
      </Switch>
      <Switch variant="soft" defaultChecked>
        Soft
      </Switch>
    </Div>
  );
}