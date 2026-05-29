import { Alert } from 'apx-ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="solid" color="info">
        Solid variant — loud, contrast-text on colored background.
      </Alert>
      <Alert variant="outline" color="info">
        Outline variant — paper background, colored border.
      </Alert>
      <Alert variant="soft" color="info">
        Soft variant — tinted background. The default.
      </Alert>
      <Alert variant="inline" color="info">
        Inline variant — left bar only, no chrome.
      </Alert>
    </div>
  );
}
