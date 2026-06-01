import Link from 'next/link';

interface ComponentCardProps {
  slug: string;
  name: string;
  description?: string | undefined;
  category?: string | undefined;
}

export function ComponentCard({ slug, name, description, category }: ComponentCardProps) {
  return (
    <Link
      href={`/components/${slug}`}
      className="group block rounded-lg border border-border bg-bg-paper p-5 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {category && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
          {category}
        </span>
      )}
      <h3 className="mt-1 text-base font-semibold text-fg group-hover:text-primary">{name}</h3>
      {description && <p className="mt-2 line-clamp-3 text-sm text-fg-muted">{description}</p>}
    </Link>
  );
}