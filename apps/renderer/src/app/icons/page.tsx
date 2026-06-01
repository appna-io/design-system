import { TopBar } from '../../components/chrome/TopBar';
import { CopyButton } from '../../components/primitives/CopyButton';
import { IconsGallery } from './IconsGallery';

export const metadata = {
  title: 'Icons · apx-ds',
  description:
    'Optional, tree-shakable SVG icon set for apx-ds. Install @apx-ui/icons separately when you want icons in your app.',
};

const INSTALL_COMMAND = 'pnpm add @apx-ui/icons';
const USAGE_SNIPPET = `import { ChevronDown } from '@apx-ui/icons';

export function Example() {
  return <ChevronDown size={20} title="Open menu" />;
}`;

export default function IconsPage() {
  return (
    <>
      <TopBar title="Icons" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <header>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            Optional package
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            <code className="font-mono text-2xl">@apx-ui/icons</code>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-fg-muted">
            A small, tree-shakable set of SVG icon components built for apx-ds. Ships as a{' '}
            <strong className="font-semibold text-fg">separate package</strong> &mdash; nothing in{' '}
            <code className="rounded bg-neutral-subtle px-1.5 py-0.5 font-mono text-xs">
              @apx-ui/ds
            </code>{' '}
            depends on it, so you only pay the bundle cost if you opt in.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-bg-paper p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Install
            </h2>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg">
              <code>{INSTALL_COMMAND}</code>
              <CopyButton text={INSTALL_COMMAND} />
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              Works the same with <code className="font-mono">npm</code>,{' '}
              <code className="font-mono">yarn</code>, or <code className="font-mono">bun</code>.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg-paper p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Usage
            </h2>
            <div className="mt-3 flex items-start justify-between gap-3 rounded-md border border-border bg-bg p-3">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-fg">
                <code>{USAGE_SNIPPET}</code>
              </pre>
              <CopyButton text={USAGE_SNIPPET} />
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              Every icon accepts <code className="font-mono">size</code>,{' '}
              <code className="font-mono">title</code> for accessible labels, and any native{' '}
              <code className="font-mono">&lt;svg&gt;</code> prop.
            </p>
          </div>
        </section>

        <hr className="mt-10 border-border" />

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-fg">All icons</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Click any tile to copy its import statement.
          </p>
        </div>

        <IconsGallery />
      </main>
    </>
  );
}