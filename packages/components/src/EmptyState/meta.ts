import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'empty-state',
  displayName: 'EmptyState',
  description:
    'Standard layout for empty lists, no-results, first-run, error, success, and loading surfaces. Compound primitive — pass icon/illustration/title/description/actions as props for the 80% case or use the .Icon / .Illustration / .Title / .Description / .Actions subparts for full control. Loading variant auto-injects <Spinner />.',
  category: 'Feedback',
  tags: ['empty', 'empty-state', 'no-data', 'no-results', 'error', 'loading', 'placeholder'],
};