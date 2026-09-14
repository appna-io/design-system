'use client';

import { useEffect, useState } from 'react';

/**
 * Which documented section the reader is currently in.
 *
 * Drives the sidebar's selected node and the on-this-page rail — both from one value, because two
 * independent trackers are two chances to disagree about where the reader is.
 *
 * ## Why an IntersectionObserver and not a scroll handler
 *
 * A scroll handler runs on the main thread on every frame and has to measure each section's
 * `getBoundingClientRect()` to answer the question — which is a forced layout per section per
 * frame. `IntersectionObserver` answers it off the main thread and only when the answer changes.
 * On a docs page with eight sections and a lot of code blocks, that difference is visible.
 *
 * ## The rootMargin
 *
 * `-45% 0px -50% 0px` collapses the viewport to a thin band just above the middle. A section is
 * "active" when *its top* crosses that band, which is what a reader means by "I am in this
 * section" — a plain `threshold` would flip to the next heading the moment one pixel of it
 * appeared at the bottom of a tall screen, while the reader is still mid-paragraph in the last
 * one.
 *
 * ## Reduced motion is not relevant here
 *
 * This is navigation state, not animation. There is nothing to disable: a reader who has asked
 * for less motion still wants to know which page they are on.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    // Track visibility in a set rather than reacting to each entry in isolation: the callback
    // fires only for sections that *changed*, so a single entry never has enough information to
    // say which section is now frontmost.
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Document order, so scrolling up lands on the earlier heading rather than whichever
        // element happened to report last.
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
