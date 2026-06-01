import { Div, Switch } from '@apx-ui/ds';

export default function WithDescription() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Switch description="We'll email you when something needs your attention.">
        Notifications
      </Switch>
      <Switch
        color="success"
        defaultChecked
        description="Auto-renews on the same plan you have now."
      >
        Automatic renewal
      </Switch>
    </Div>
  );
}