import { useMediaQuery } from "./useMediaQuery";

export const TABLET_BREAKPOINT = 1024;

export function useIsTablet() {
  const isTablet = useMediaQuery(`(max-width: ${TABLET_BREAKPOINT}px)`);

  return isTablet;
}
