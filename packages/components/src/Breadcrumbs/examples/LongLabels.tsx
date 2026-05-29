import { Breadcrumbs } from 'apx-ds';

export default function LongLabels() {
  return (
    <div className="max-w-md border border-border rounded-md p-3">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#home' },
          {
            label: (
              <span className="inline-block max-w-[12rem] truncate align-bottom">
                A very long workspace name that should ellipsis
              </span>
            ),
            href: '#workspace',
          },
          {
            label: (
              <span className="inline-block max-w-[10rem] truncate align-bottom">
                Even longer issue title goes here
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
