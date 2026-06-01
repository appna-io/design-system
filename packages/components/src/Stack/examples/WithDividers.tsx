import { Div, Stack } from '@apx-ui/ds';

export default function WithDividers() {
  return (
    <Stack
      gap={2}
      divider={<hr className="border-0 h-px bg-border" />}
      className="max-w-sm"
    >
      <Div className="px-1 py-2">Profile</Div>
      <Div className="px-1 py-2">Notifications</Div>
      <Div className="px-1 py-2">Billing</Div>
      <Div className="px-1 py-2">Sign out</Div>
    </Stack>
  );
}