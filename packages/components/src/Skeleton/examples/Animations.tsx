import { Div, Skeleton, Typography } from '@apx-ui/ds';

export default function Animations() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-[360px]">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          shimmer (default)
        </Typography>
        <Skeleton animation="shimmer" width="100%" height={24} />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          pulse
        </Typography>
        <Skeleton animation="pulse" width="100%" height={24} />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          none
        </Typography>
        <Skeleton animation="none" width="100%" height={24} />
      </Div>
    </Div>
  );
}