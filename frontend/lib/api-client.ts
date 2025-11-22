/**
 * API Client for StockMaster
 * Base configuration for all API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Get access token from cookies or localStorage
 * Priority: cookies first (for regular login), then localStorage (for dev login)
 */
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;

  // First, try to get from cookies (regular login flow)
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));

  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }

  // Fallback to localStorage (dev login or manual token storage)
  if (typeof window !== 'undefined' && window.localStorage) {
    const devToken = window.localStorage.getItem('devAccessToken');
    if (devToken) {
      return devToken;
    }
  }

  return null;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare the request body
  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  };

  // Stringify body if it's an object and not already a string
  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, requestOptions);

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (response.status === 401) {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('devAccessToken');
        }

        // Clear cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw new APIError(
        data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or other errors
    throw new APIError(
      'Network error. Please check your connection.',
      0
    );
  }
}

/**
 * API request methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
