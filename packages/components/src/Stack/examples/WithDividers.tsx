import { Stack } from '@apx-ui/ds';

export default function WithDividers() {
  return (
    <Stack
      gap={2}
      divider={<hr className="border-0 h-px bg-border" />}
      className="max-w-sm"
    >
      <div className="px-1 py-2">Profile</div>
      <div className="px-1 py-2">Notifications</div>
      <div className="px-1 py-2">Billing</div>
      <div className="px-1 py-2">Sign out</div>
    </Stack>
  );
}
