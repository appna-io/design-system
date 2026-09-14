import { createIcon } from '../createIcon';

/**
 * Not `directional`. `ArrowRight` mirrors under RTL because "onward" is leftward in an
 * RTL reading order; down is down in every locale, so mirroring this would be churn — the same
 * reasoning the manifest applies to `ArrowUpRight`.
 */
export const ArrowDown = createIcon(
  'ArrowDown',
  <>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </>,
);
