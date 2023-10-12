import { useEffect, useState } from "react"
import { useResizeType } from "../types/interfaces/useResizeType";

export const useResize = (): useResizeType => {
  const [width, setWidth] = useState<number>(window.visualViewport!.width);
  const [height, setHeight] = useState<number>(window.visualViewport!.height);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.visualViewport!.width);
      setHeight(window.visualViewport!.height);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {width, height};
}