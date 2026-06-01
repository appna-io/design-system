import { Div, Kbd, Typography } from '@apx-ui/ds';

/**
 * `<Kbd>` is its own export — useful well outside CommandPalette (docs, tooltips, menu rows).
 * Three sizes × three variants × the `keys` multi-token form. The `platform` axis routes
 * glyphs via `macKey()` so the same source renders as `⌘ K` on Mac and `Ctrl + K` elsewhere.
 */
export default function KbdShowcase() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="text-sm">
      <Div display="flex" alignItems="center" gap="2">
        <Typography as="span" variant="bodySmall">Sizes:</Typography>
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="md">⌘</Kbd>
        <Kbd size="lg">⌘</Kbd>
      </Div>
      <Div display="flex" alignItems="center" gap="2">
        <Typography as="span" variant="bodySmall">Variants:</Typography>
        <Kbd variant="solid">K</Kbd>
        <Kbd variant="outline">K</Kbd>
        <Kbd variant="soft">K</Kbd>
      </Div>
      <Div display="flex" alignItems="center" gap="2">
        <Typography as="span" variant="bodySmall">Multi-key:</Typography>
        <Kbd keys={['Ctrl', 'Shift', 'P']} />
      </Div>
      <Div display="flex" alignItems="center" gap="2">
        <Typography as="span" variant="bodySmall">Mac glyphs:</Typography>
        <Kbd keys={['cmd', 'shift', 'K']} platform="mac" />
        <Typography as="span" variant="bodySmall" className="opacity-60">vs Win:</Typography>
        <Kbd keys={['cmd', 'shift', 'K']} platform="win" />
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        Inline in prose: press <Kbd size="sm">/</Kbd> to focus the search bar, or{' '}
        <Kbd keys={['cmd', 'K']} size="sm" /> to open the command palette.
      </Typography>
    </Div>
  );
}