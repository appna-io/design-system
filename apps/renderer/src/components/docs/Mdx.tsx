import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { ComponentProps, ReactNode } from 'react';
import remarkGfm from 'remark-gfm';

import type { ComponentEntry, ExampleSource } from '../../lib/discover';
import { cn } from '../primitives/cn';
import { Callout } from './Callout';
import { CodeBlock } from './CodeBlock';
import { ExampleBlock } from './ExampleBlock';
import { PropsTable } from './PropsTable';

interface MdxProps {
  source: string;
  /** Component context so `<ExampleBlock for="Basic" />` and `<PropsTable />` know what to use. */
  component?: ComponentEntry;
}

// Centralised MDX compile options. `parseFrontmatter` strips the leading YAML block in
// `README.mdx` files (otherwise it shows up as literal `--- title: …` text in the page), and
// `remark-gfm` turns on GitHub-flavoured tables, strikethrough, task lists, and autolinks — all
// of which the component READMEs already author with.
const mdxOptions: NonNullable<MDXRemoteProps['options']> = {
  parseFrontmatter: true,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

function makeComponents(component?: ComponentEntry): MDXRemoteProps['components'] {
  return {
    h1: ({ className, children, ...props }: ComponentProps<'h1'>) => (
      <h1
        {...props}
        className={cn(
          'mt-10 mb-4 text-3xl font-semibold tracking-tight text-fg first:mt-0',
          className,
        )}
      >
        {children}
      </h1>
    ),
    h2: ({ className, children, ...props }: ComponentProps<'h2'>) => (
      <h2
        {...props}
        className={cn(
          'mt-10 mb-3 border-b border-border pb-1.5 text-2xl font-semibold tracking-tight text-fg',
          className,
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }: ComponentProps<'h3'>) => (
      <h3 {...props} className={cn('mt-8 mb-2 text-lg font-semibold text-fg', className)}>
        {children}
      </h3>
    ),
    p: ({ className, children, ...props }: ComponentProps<'p'>) => (
      <p {...props} className={cn('my-4 text-sm leading-relaxed text-fg-muted', className)}>
        {children}
      </p>
    ),
    ul: ({ className, children, ...props }: ComponentProps<'ul'>) => (
      <ul {...props} className={cn('my-4 list-disc ps-6 text-sm text-fg-muted', className)}>
        {children}
      </ul>
    ),
    ol: ({ className, children, ...props }: ComponentProps<'ol'>) => (
      <ol {...props} className={cn('my-4 list-decimal ps-6 text-sm text-fg-muted', className)}>
        {children}
      </ol>
    ),
    li: ({ className, children, ...props }: ComponentProps<'li'>) => (
      <li {...props} className={cn('my-1', className)}>
        {children}
      </li>
    ),
    a: ({ className, children, ...props }: ComponentProps<'a'>) => (
      <a
        {...props}
        className={cn('font-medium text-primary underline-offset-2 hover:underline', className)}
      >
        {children}
      </a>
    ),
    code: ({ className, children, ...props }: ComponentProps<'code'>) => (
      <code
        {...props}
        className={cn(
          'rounded bg-neutral-subtle px-1 py-0.5 font-mono text-[0.85em] text-fg',
          className,
        )}
      >
        {children}
      </code>
    ),
    pre: ({ children }: { children?: ReactNode }) => {
      // The `pre > code` shape from markdown fences. We extract text and run it through Shiki.
      const codeNode = (
        children as { props?: { children?: string; className?: string } } | undefined
      )?.props;
      const text = typeof codeNode?.children === 'string' ? codeNode.children : '';
      const lang = codeNode?.className?.replace(/^language-/, '') ?? 'tsx';
      return <CodeBlock code={text} lang={lang} />;
    },
    blockquote: ({ className, children, ...props }: ComponentProps<'blockquote'>) => (
      <blockquote
        {...props}
        className={cn(
          'my-4 border-s-2 border-border ps-4 text-sm italic text-fg-muted',
          className,
        )}
      >
        {children}
      </blockquote>
    ),
    hr: ({ className, ...props }: ComponentProps<'hr'>) => (
      <hr {...props} className={cn('my-8 border-0 border-t border-border', className)} />
    ),
    // GFM tables. We render the `<table>` inside a horizontally-scrolling wrapper so wide tables
    // never blow out the layout, and theme borders / padding to match the props table.
    table: ({ className, children, ...props }: ComponentProps<'table'>) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-border">
        <table
          {...props}
          className={cn('min-w-full border-collapse text-sm text-fg', className)}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ className, children, ...props }: ComponentProps<'thead'>) => (
      <thead {...props} className={cn('bg-bg-paper', className)}>
        {children}
      </thead>
    ),
    tbody: ({ className, children, ...props }: ComponentProps<'tbody'>) => (
      <tbody {...props} className={className}>
        {children}
      </tbody>
    ),
    tr: ({ className, children, ...props }: ComponentProps<'tr'>) => (
      <tr {...props} className={cn('border-b border-border last:border-b-0', className)}>
        {children}
      </tr>
    ),
    th: ({ className, children, ...props }: ComponentProps<'th'>) => (
      <th
        {...props}
        className={cn(
          'px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-fg-muted',
          className,
        )}
      >
        {children}
      </th>
    ),
    td: ({ className, children, ...props }: ComponentProps<'td'>) => (
      <td
        {...props}
        className={cn('px-3 py-2 align-top text-sm text-fg [&_code]:text-[0.85em]', className)}
      >
        {children}
      </td>
    ),
    Callout,
    ExampleBlock: ({ for: forExample, title }: { for: string; title?: string }) => {
      if (!component) return null;
      const example: ExampleSource | undefined = component.examples.find(
        (e) => e.id === forExample,
      );
      if (!example) {
        return (
          <Callout type="warning" title={`Example "${forExample}" not found`}>
            Add a file named <code>{forExample}.tsx</code> under{' '}
            <code>{component.dirName}/examples/</code> to render it here.
          </Callout>
        );
      }
      return (
        <div className="my-6">
          <ExampleBlock
            dirName={component.dirName}
            exampleId={example.id}
            source={example.source}
            title={title ?? example.id}
          />
        </div>
      );
    },
    PropsTable: () => {
      if (!component) return null;
      return (
        <div className="my-6">
          <PropsTable sourcePath={component.sourcePath} />
        </div>
      );
    },
  };
}

export function Mdx({ source, component }: MdxProps) {
  return (
    <MDXRemote source={source} components={makeComponents(component)} options={mdxOptions} />
  );
}