'use client';

import { useTheme } from './useTheme';

export interface UseVariantReturn {
  variant: string;
  setVariant: (variant: string) => void;
}

export function useVariant(): UseVariantReturn {
  const { variant, setVariant } = useTheme();
  return { variant, setVariant };
}