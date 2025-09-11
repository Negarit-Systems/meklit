import { useEffect, useState } from "react";

/**
 * useMediaQuery
 * - thisfile is just a hook that listens to a CSS media query and returns whether it currently matches.
 */

export function useMediaQuery(query: string, defaultState: boolean = false) {
  const getMatches = (q: string) => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return defaultState;
    }
    return window.matchMedia(q).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mql = window.matchMedia(query);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };

    onChange(mql);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener(
        "change",
        onChange as (ev: MediaQueryListEvent) => void
      );
    } else {
      const legacy = mql as unknown as {
        addListener?: (
          listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
        ) => void;
      };
      legacy.addListener?.(
        onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void
      );
    }

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener(
          "change",
          onChange as (ev: MediaQueryListEvent) => void
        );
      } else {
        const legacy = mql as unknown as {
          removeListener?: (
            listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
          ) => void;
        };
        legacy.removeListener?.(
          onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void
        );
      }
    };
  }, [query]);

  return matches;
}
