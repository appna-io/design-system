import { Switch } from 'apx-ds';

export default function Invalid() {
  return (
    <div className="flex flex-col gap-2">
      <Switch invalid description="Two-factor must be on for admin accounts.">
        Two-factor authentication
      </Switch>
    </div>
  );
}
