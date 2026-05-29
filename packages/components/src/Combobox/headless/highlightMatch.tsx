import { Fragment, type ReactNode } from 'react';

/**
 * Pure helper — splits `label` around every (case-insensitive) occurrence of `query`, returning
 * a `ReactNode` where matching chunks are wrapped in `<mark>` tags so they paint via the
 * comboboxRecipes.highlight recipe.
 *
 * Empty queries echo the label unchanged. Single-character queries highlight every occurrence —
 * Mantine and Headless UI both do this and users seem to expect it.
 *
 * Why a regex with the literal escape: the query can contain `.`, `*`, `+`, etc. and we don't
 * want them to be treated as regex metacharacters. The escape pattern is the canonical MDN
 * recommendation for "treat a user string as literal in a regex".
 */
export function highlightMatch(label: string, query: string, markClassName?: string): ReactNode {
  if (!query) return label;
  const escaped = escapeRegExp(query);
  // Case-insensitive global so we capture every occurrence. The capture group makes split() keep
  // the delimiters in the result array — every other entry is therefore a match.
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = label.split(re);
  return (
    <>
      {parts.map((part, idx) => {
        // Indices 1, 3, 5, … are the captured matches; even indices are the surrounding text.
        const isMatch = idx % 2 === 1;
        if (isMatch) {
          return (
            <mark key={idx} className={markClassName}>
              {part}
            </mark>
          );
        }
        // Empty leading/trailing chunks would render nothing — short-circuit to keep the array
        // tidy and prevent React from warning about empty Fragments.
        if (!part) return null;
        return <Fragment key={idx}>{part}</Fragment>;
      })}
    </>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
