import { Avatar, Div } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" alignItems="center" gap="4">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop"
        name="Ada Lovelace"
      />
      <Avatar name="Bren Park" />
      <Avatar />
    </Div>
  );
}