import { useEffect } from "react";

export const useObserver = (
  rootElement: Element | null, 
  observerTarget: Element | null, 
  isLoading: boolean, 
  okCondition: boolean,
  callback: () => void,
) => {

  useEffect(() => {
    const cb = (entries: IntersectionObserverEntry[]) => {
      if (isLoading) return;
      if (entries[0].isIntersecting && okCondition) {
        callback();
      }
    }

    const observer = new IntersectionObserver(cb, {
      root: rootElement,
      rootMargin: rootElement ? `${rootElement.scrollHeight / 3}px` : '0px',
    })

    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    }
  }, [isLoading]);

}