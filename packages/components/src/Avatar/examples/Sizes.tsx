import { Avatar, Div, type AvatarSize } from '@apx-ui/ds';

const SIZES: readonly AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export default function Sizes() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="end" gap="4">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace" label={size} />
      ))}
    </Div>
  );
}
