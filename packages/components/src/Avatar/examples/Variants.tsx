import { Avatar, Div, type AvatarVariant } from '@apx-ui/ds';

const VARIANTS: readonly AvatarVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      {VARIANTS.map((variant) => (
        <Avatar key={variant} variant={variant} name="Ada Lovelace" color="primary" label={variant} />
      ))}
    </Div>
  );
}
