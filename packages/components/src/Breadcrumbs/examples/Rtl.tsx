import { Breadcrumbs } from 'apx-ds';

export default function Rtl() {
  return (
    <div dir="rtl" className="border border-border rounded-md p-3">
      <Breadcrumbs
        aria-label="\u05e0\u05ea\u05d9\u05d1"
        items={[
          { label: '\u05d1\u05d9\u05ea', href: '#home' },
          { label: '\u05de\u05e9\u05ea\u05de\u05e9\u05d9\u05dd', href: '#users' },
          { label: '\u05d9\u05d5\u05d7\u05e0\u05df \u05e7\u05d4\u05df' },
        ]}
      />
    </div>
  );
}
