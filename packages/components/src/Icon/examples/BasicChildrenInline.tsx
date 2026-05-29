import { Icon } from 'apx-ds';

export default function BasicChildrenInline() {
  return (
    <Icon size="lg" label="Sparkle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </Icon>
  );
}
