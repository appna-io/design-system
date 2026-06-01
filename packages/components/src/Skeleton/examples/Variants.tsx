import { Div, Skeleton, Typography } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-[360px]">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          solid (default)
        </Typography>
        <Skeleton variant="solid" width="100%" height={24} />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          soft (color-tinted)
        </Typography>
        <Skeleton variant="soft" color="primary" width="100%" height={24} />
      </Div>
    </Div>
  );
}