import { Div, Typography } from 'apx-ds';

export default function Truncate() {
  return (
    <Div maxWidth={280}>
      <Typography truncate>
        A very long single-line title that will get clipped with a trailing ellipsis when the
        container is too narrow to fit it.
      </Typography>
    </Div>
  );
}
