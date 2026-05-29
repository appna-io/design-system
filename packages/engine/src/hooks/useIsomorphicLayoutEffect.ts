import { useEffect, useLayoutEffect } from 'react';

/**
 * Uses `useLayoutEffect` in the browser and `useEffect` on the server (SSR) to avoid the
 * "useLayoutEffect does nothing on the server" warning. Identical signature to `useEffect`.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
