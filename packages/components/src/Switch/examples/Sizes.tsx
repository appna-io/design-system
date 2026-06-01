import { Div, Switch } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Switch size="sm" defaultChecked>
        Small
      </Switch>
      <Switch size="md" defaultChecked>
        Medium
      </Switch>
      <Switch size="lg" defaultChecked>
        Large
      </Switch>
    </Div>
  );
}