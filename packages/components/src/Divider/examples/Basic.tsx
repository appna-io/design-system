import { Divider } from '@apx-ui/ds';

export default function Basic() {
  return (
    <div className="space-y-4">
      <p className="text-sm">Above the rule.</p>
      <Divider />
      <p className="text-sm">Below the rule.</p>
    </div>
  );
}
