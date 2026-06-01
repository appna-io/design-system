import { Avatar, Div, HoverCard, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Typography variant="bodySmall" as="p">
      Assigned to{' '}
      <HoverCard>
        <HoverCard.Trigger>
          <a href="#user-maya" className="text-primary underline">
            @maya
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content size="md">
          <Div display="flex" gap="3">
            <Avatar
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
              name="Maya Singh"
              size="md"
            />
            <Div display="flex" flexDirection="column" gap="1">
              <Typography variant="bodySmall" weight="semibold" as="strong">
                Maya Singh
              </Typography>
              <Typography as="span" variant="caption" color="fg.muted">
                @maya
              </Typography>
              <Typography variant="caption">
                Product designer on the design-system team. Based in San Francisco.
              </Typography>
            </Div>
          </Div>
        </HoverCard.Content>
      </HoverCard>{' '}
      for this sprint.
    </Typography>
  );
}