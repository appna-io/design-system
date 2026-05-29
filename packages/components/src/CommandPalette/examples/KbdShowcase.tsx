import { Kbd } from 'apx-ds';

/**
 * `<Kbd>` is its own export — useful well outside CommandPalette (docs, tooltips, menu rows).
 * Three sizes × three variants × the `keys` multi-token form. The `platform` axis routes
 * glyphs via `macKey()` so the same source renders as `⌘ K` on Mac and `Ctrl + K` elsewhere.
 */
export default function KbdShowcase() {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <section className="flex items-center gap-2">
        <span>Sizes:</span>
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="md">⌘</Kbd>
        <Kbd size="lg">⌘</Kbd>
      </section>
      <section className="flex items-center gap-2">
        <span>Variants:</span>
        <Kbd variant="solid">K</Kbd>
        <Kbd variant="outline">K</Kbd>
        <Kbd variant="soft">K</Kbd>
      </section>
      <section className="flex items-center gap-2">
        <span>Multi-key:</span>
        <Kbd keys={['Ctrl', 'Shift', 'P']} />
      </section>
      <section className="flex items-center gap-2">
        <span>Mac glyphs:</span>
        <Kbd keys={['cmd', 'shift', 'K']} platform="mac" />
        <span className="opacity-60">vs Win:</span>
        <Kbd keys={['cmd', 'shift', 'K']} platform="win" />
      </section>
      <p className="text-fg-muted">
        Inline in prose: press <Kbd size="sm">/</Kbd> to focus the search bar, or{' '}
        <Kbd keys={['cmd', 'K']} size="sm" /> to open the command palette.
      </p>
    </div>
  );
}
