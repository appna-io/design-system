import { Avatar, Div } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop"
        name="Ada Lovelace"
        label="Photo URL"
      />
      <Avatar name="Bren Park" color="primary" label="Explicit color" />
      <Avatar label="No source" />
    </Div>
  );
}
