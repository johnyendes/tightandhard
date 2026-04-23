import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export const useErrorRecovery = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = config;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  const calculateDelay = useCallback((attempt: number) => {
    const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }, [baseDelay, backoffFactor, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    onError?: (error: Error, attempt: number) => void
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          setRetryCount(attempt);
          
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, delay);
            retryTimeouts.current.add(timeout);
            
            setTimeout(() => {
              retryTimeouts.current.delete(timeout);
            }, delay);
          });
        }

        const result = await operation();
        
        if (attempt > 0) {
          toast.success(`Operation succeeded after ${attempt} retries`);
        }
        
        setIsRetrying(false);
        setRetryCount(0);
        return result;

      } catch (error) {
        lastError = error as Error;
        
        if (onError) {
          onError(lastError, attempt);
        }

        if (attempt === maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          toast.error(`Operation failed after ${maxRetries} retries: ${lastError.message}`);
          throw lastError;
        }

        console.warn(`Attempt ${attempt + 1} failed, retrying...`, lastError);
      }
    }

    throw lastError!;
  }, [maxRetries, calculateDelay]);

  const clearRetries = useCallback(() => {
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    clearRetries
  };
};