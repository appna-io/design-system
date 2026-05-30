import { Avatar, AvatarGroup, Div, Typography } from '@apx-ui/ds';

export default function Group() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          max=4 with overflow
        </Typography>
        <AvatarGroup max={4}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
          <Avatar name="Dax Lin" />
          <Avatar name="Eli Tan" />
          <Avatar name="Fae Romero" />
          <Avatar name="Gigi Khan" />
        </AvatarGroup>
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          Soft variant, larger spacing, lg size
        </Typography>
        <AvatarGroup max={3} variant="soft" size="lg" spacing={-3}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
          <Avatar name="Dax Lin" />
          <Avatar name="Eli Tan" />
        </AvatarGroup>
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          No overlap (positive spacing)
        </Typography>
        <AvatarGroup spacing={2}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
        </AvatarGroup>
      </Div>
    </Div>
  );
}
