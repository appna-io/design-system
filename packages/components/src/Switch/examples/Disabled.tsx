import { Div, Switch } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Switch disabled>Disabled, off</Switch>
      <Switch disabled defaultChecked>
        Disabled, on
      </Switch>
    </Div>
  );
}