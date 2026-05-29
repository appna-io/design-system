import { Switch } from '@apx-ui/ds';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function WithThumbIcons() {
  return (
    <div className="flex flex-col gap-3">
      <Switch
        size="lg"
        color="warning"
        thumbIcon={{ on: <SunIcon />, off: <MoonIcon /> }}
        defaultChecked
      >
        Light mode
      </Switch>
      <Switch
        size="lg"
        color="info"
        thumbIcon={{ on: <SunIcon />, off: <MoonIcon /> }}
      >
        Dark mode
      </Switch>
    </div>
  );
}
