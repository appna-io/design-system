import { Switch } from '@apx-ui/ds';

export default function WithDescription() {
  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}
