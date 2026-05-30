import { Avatar, Div, Typography } from '@apx-ui/ds';

export default function ProfileCard() {
  return (
    <Div display="flex" alignItems="center" gap="4" borderRadius="lg" border="1px solid" borderColor="border" bg="bg.paper" p="4" boxShadow="sm">
      <Avatar
        size="lg"
        name="Ada Lovelace"
        status="online"
        ring="primary"
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop"
      />
      <Div display="flex" flexDirection="column">
        <Typography variant="bodySmall" weight="semibold" color="fg.default">Ada Lovelace</Typography>
        <Typography variant="caption" color="fg.muted">Staff Engineer · Mathematics</Typography>
      </Div>
    </Div>
  );
}
