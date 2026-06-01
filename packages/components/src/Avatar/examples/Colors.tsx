import { Avatar, Div, Typography, type AvatarColor } from '@apx-ui/ds';

const EXPLICIT_COLORS: readonly Exclude<AvatarColor, 'auto'>[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const AUTO_NAMES = ['Ada', 'Bren', 'Cleo', 'Dax', 'Eli', 'Fae', 'Gigi', 'Hugo'];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          Explicit color
        </Typography>
        <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
          {EXPLICIT_COLORS.map((color) => (
            <Avatar key={color} color={color} name={color.charAt(0).toUpperCase()} />
          ))}
        </Div>
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          color=&ldquo;auto&rdquo; (deterministic from name)
        </Typography>
        <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
          {AUTO_NAMES.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </Div>
      </Div>
    </Div>
  );
}