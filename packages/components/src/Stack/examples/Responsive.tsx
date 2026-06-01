import { Div, Stack } from '@apx-ui/ds';

export default function Responsive() {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 2, md: 4 }}
      align="stretch"
    >
      <Div as="aside" className="rounded-lg bg-bg-subtle p-4 md:w-48">
        Sidebar
      </Div>
      <Div as="main" className="flex-1 rounded-lg border border-border bg-bg-paper p-4">
        Resize the viewport &mdash; the layout flips from column to row at the <code>md</code>{' '}
        breakpoint.
      </Div>
    </Stack>
  );
}