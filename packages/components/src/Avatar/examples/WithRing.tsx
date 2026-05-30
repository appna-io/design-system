import { Avatar, Div, type AvatarRing } from '@apx-ui/ds';

const RINGS: readonly Exclude<AvatarRing, 'none'>[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function WithRing() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="5">
      {RINGS.map((ring) => (
        <Avatar key={ring} name="Ada Lovelace" ring={ring} label={ring} />
      ))}
    </Div>
  );
}
