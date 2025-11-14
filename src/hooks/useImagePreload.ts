import { useEffect, useState } from "react";

type UseImagePreloadResult = {
  hasError: boolean;
  isLoading: boolean;
  loadedSrc: string | null;
};

export const useImagePreload = (
  src?: string | null
): UseImagePreloadResult => {
  const [state, setState] = useState<UseImagePreloadResult>({
    hasError: false,
    isLoading: Boolean(src),
    loadedSrc: null,
  });

  useEffect(() => {
    if (!src) {
      setState({
        hasError: false,
        isLoading: false,
        loadedSrc: null,
      });
      return;
    }

    let isMounted = true;
    let image: HTMLImageElement | null = null;

    const handleLoad = () => {
      if (!isMounted) return;
      setState({
        hasError: false,
        isLoading: false,
        loadedSrc: src,
      });
    };

    const handleError = () => {
      if (!isMounted) return;
      setState({
        hasError: true,
        isLoading: false,
        loadedSrc: null,
      });
    };

    setState({
      hasError: false,
      isLoading: true,
      loadedSrc: null,
    });

    if (typeof window !== "undefined" && typeof Image !== "undefined") {
      image = new Image();
      image.onload = handleLoad;
      image.onerror = handleError;
      image.src = src;
    } else {
      handleError();
    }

    return () => {
      isMounted = false;
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [src]);

  return state;
};
