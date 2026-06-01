import { Breadcrumbs, Div, Typography } from '@apx-ui/ds';

export default function LongLabels() {
  return (
    <Div className="max-w-md border border-border rounded-md p-3">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#home' },
          {
            label: (
              <Typography as="span" className="inline-block max-w-[12rem] truncate align-bottom">
                A very long workspace name that should ellipsis
              </Typography>
            ),
            href: '#workspace',
          },
          {
            label: (
              <Typography as="span" className="inline-block max-w-[10rem] truncate align-bottom">
                Even longer issue title goes here
              </Typography>
            ),
          },
        ]}
      />
    </Div>
  );
}