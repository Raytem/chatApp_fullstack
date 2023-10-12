
import { AxiosError } from "axios";
import { useState } from "react"

// eslint-disable-next-line @typescript-eslint/ban-types
export const useFetch = <T>(callback: (data?: T)=> {}) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetching = async (data?: T) => {
    try {
      setIsLoading(true);
      await callback(data);
      AxiosError.ECONNABORTED;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.response.data?.message);
    } finally {
      setIsLoading(false);
    }
  }

  return [fetching, isLoading, error] as const;
}