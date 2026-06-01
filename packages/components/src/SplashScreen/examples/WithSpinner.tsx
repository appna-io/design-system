import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="24" fill="var(--sds-palette-primary-main)" />
    <text
      x="32"
      y="40"
      textAnchor="middle"
      fontSize="24"
      fontWeight="700"
      fill="var(--sds-palette-primary-contrast)"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      A
    </text>
  </svg>
);

/**
 * `showSpinner: true` renders an indeterminate `<Spinner />` below the subtitle. Tinted by
 * the same `color` role driving the rest of the splash.
 */
export default function WithSpinner() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Pass <code>showSpinner: true</code> for an indeterminate Spinner indicator tinted to
        the splash's <code>color</code> role.
      </Typography>
      <Button
        onClick={() =>
          splash.show({
            variant: 'fade',
            color: 'primary',
            logo: Logo,
            title: 'Acme',
            subtitle: 'Connecting to your account…',
            showSpinner: true,
            timeout: 3500,
            closeOnClick: true,
          })
        }
      >
        Launch splash with spinner
      </Button>
    </Div>
  );
}