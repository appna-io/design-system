'use client';

import { createContext, useContext } from 'react';

import type { ModalContextValue } from './Modal.types';

/**
 * Single context shared across every Modal subpart. The Header reads `titleId` / `descId` so
 * ARIA association happens automatically; Footer reads `size` to inherit padding; Close reads
 * `setOpen` to dismiss.
 *
 * The throwing helper catches the most common authoring mistake: rendering a subpart outside a
 * `<Modal>` ancestor.
 */
export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(componentName: string): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Modal> ancestor.`,
    );
  }
  return ctx;
}