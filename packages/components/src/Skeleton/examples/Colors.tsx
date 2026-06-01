import { Div, Skeleton, Typography } from '@apx-ui/ds';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-[360px]">
      {COLORS.map((color) => (
        <Div key={color} display="flex" alignItems="center" gap="3">
          <Typography as="span" variant="caption" weight="medium" color="fg.muted" className="w-20">
            {color}
          </Typography>
          <Skeleton variant="soft" color={color} width="100%" height={20} />
        </Div>
      ))}
    </Div>
  );
}