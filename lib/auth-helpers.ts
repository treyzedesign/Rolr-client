import { getAuthToken, getUserData } from "@/lib/cookies";
import { isTokenExpired } from "@/lib/jwt";

// Quick auth check without API calls
export const isUserAuthenticated = (): boolean => {
  const token = getAuthToken();
  const userData = getUserData();
  
  if (!token || !userData) {
    return false;
  }
  
  return !isTokenExpired(token);
};

// Get user role from cookies
export const getUserRole = (): string | null => {
  const userData = getUserData();
  return userData?.role || null;
};

// Get user ID from cookies
export const getUserId = (): string | null => {
  const userData = getUserData();
  return userData?.id || null;
};

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};
