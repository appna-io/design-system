import { EmptyState } from '@apx-ui/ds';

function SearchIllustration() {
  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="10" y="20" width="180" height="110" rx="12" fill="currentColor" opacity="0.08" />
      <circle cx="80" cy="70" r="28" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.45" />
      <line x1="100" y1="90" x2="125" y2="115" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <circle cx="140" cy="40" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="160" cy="50" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="155" cy="30" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export default function WithIllustration() {
  return (
    <EmptyState
      illustration={<SearchIllustration />}
      title="No results"
      description="Try a different keyword or clear the filters."
    />
  );
}