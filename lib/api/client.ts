import axios from "axios";
import { getAuthToken } from "@/lib/cookies";

let url:string = "";

if (process.env.NEXT_PUBLIC_ENV === 'development') {
  url = process.env.NEXT_PUBLIC_DEV_API_URL as string;
}else if (process.env.NEXT_PUBLIC_ENV === 'production') {
  url = process.env.NEXT_PUBLIC_PROD_API_URL as string;
} else if (process.env.NEXT_PUBLIC_ENV === 'test') {
  url = process.env.NEXT_PUBLIC_TEST_API_URL as string;
}


export const apiClient = axios.create({
  baseURL: url,
  timeout: 12000,
});

// Add request interceptor to include token from cookies
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
    // Log successful responses
    console.log('Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.log(error);

    if (error.response?.status === 401) {
      // Clear auth cookies on 401 error
      const { clearAuthCookies } = require("@/lib/cookies");
      clearAuthCookies();
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export function withAuthToken(token?: string) {
  // This function is kept for backward compatibility
  // but actual token management is now handled by cookies
  if (!token) {
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}
