import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

interface RequestMetadata {
  requestId: string;
  timestamp: number;
}

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: RequestMetadata;
  }
}

class ApiErrorRecovery {
  private static instance: ApiErrorRecovery;
  private retryQueue: Map<string, number> = new Map();
  private maxRetries = 3;
  private baseDelay = 1000;

  static getInstance(): ApiErrorRecovery {
    if (!ApiErrorRecovery.instance) {
      ApiErrorRecovery.instance = new ApiErrorRecovery();
    }
    return ApiErrorRecovery.instance;
  }

  setupInterceptors(axiosInstance: typeof axios) {
    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.metadata = { 
          ...config.metadata, 
          requestId: this.generateRequestId(),
          timestamp: Date.now()
        };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with auto-retry
    axiosInstance.interceptors.response.use(
      (response) => {
        // Clear retry count on success
        const requestId = response.config.metadata?.requestId;
        if (requestId) {
          this.retryQueue.delete(requestId);
        }
        return response;
      },
      async (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private async handleError(error: AxiosError): Promise<any> {
    const config = error.config as AxiosRequestConfig & { metadata?: RequestMetadata };
    const requestId = config?.metadata?.requestId;

    if (!config || !requestId) {
      return Promise.reject(error);
    }

    const retryCount = this.retryQueue.get(requestId) || 0;

    // Check if error is retryable
    if (!this.isRetryableError(error) || retryCount >= this.maxRetries) {
      this.retryQueue.delete(requestId);
      
      // Handle specific error types
      await this.handleSpecificError(error);
      
      return Promise.reject(error);
    }

    // Increment retry count
    this.retryQueue.set(requestId, retryCount + 1);

    // Calculate delay with exponential backoff
    const delay = this.baseDelay * Math.pow(2, retryCount);
    
    console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries}) after ${delay}ms`, {
      url: config.url,
      method: config.method,
      error: error.message
    });

    // Wait before retrying
    await this.delay(delay);

    // Retry the request
    try {
      return await axios(config);
    } catch (retryError) {
      return this.handleError(retryError as AxiosError);
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors, timeouts, etc.
      return true;
    }

    const status = error.response.status;
    
    // Retry on server errors and some client errors
    return status >= 500 || status === 408 || status === 429;
  }

  private async handleSpecificError(error: AxiosError): Promise<void> {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Token might be expired, try to refresh
        await this.handleUnauthorized();
        break;
      
      case 403:
        toast.error('Access denied. Please check your permissions.');
        break;
      
      case 404:
        toast.error('Resource not found.');
        break;
      
      case 429:
        toast.error('Too many requests. Please wait a moment.');
        break;
      
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server error. Our team has been notified.');
        break;
      
      default:
        if (!error.response) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('An unexpected error occurred.');
        }
    }
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      // Attempt to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Update axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Session refreshed automatically');
      } else {
        throw new Error('No refresh token available');
      }
    } catch (error) {
      // Refresh failed, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to clear all retries
  clearAllRetries(): void {
    this.retryQueue.clear();
  }

  // Get retry statistics
  getRetryStats(): { [key: string]: number } {
    return Object.fromEntries(this.retryQueue);
  }
}

// Export singleton instance
export const apiErrorRecovery = ApiErrorRecovery.getInstance();