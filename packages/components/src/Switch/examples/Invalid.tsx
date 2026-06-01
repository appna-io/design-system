import { Div, Switch } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Switch invalid description="Two-factor must be on for admin accounts.">
        Two-factor authentication
      </Switch>
    </Div>
  );
}