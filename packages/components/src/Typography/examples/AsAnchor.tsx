import { Typography } from 'apx-ds';

export default function AsAnchor() {
  return (
    <Typography variant="body" actLike="a" href="/docs" decoration="underline">
      A body-styled paragraph that&apos;s actually an anchor — semantic href, visual body
      treatment.
    </Typography>
  );
}
