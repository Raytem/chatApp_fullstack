import { useEffect, useState } from "react"

export const usePageVisibility = () => {
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

  useEffect(() => {
    const handler = () => {
      setIsPageVisible(!document.hidden);
    }

    document.addEventListener('visibilitychange', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
    }
  }, [])

  return { isPageVisible };
}