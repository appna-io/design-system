import { Div, Switch } from '@apx-ui/ds';

export default function Shapes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Switch shape="pill" defaultChecked>
        Pill (default)
      </Switch>
      <Switch shape="square" defaultChecked>
        Square
      </Switch>
    </Div>
  );
}