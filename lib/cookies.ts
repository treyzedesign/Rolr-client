import Cookies from 'js-cookie';

// Cookie name for auth token
const AUTH_TOKEN_COOKIE = 'workswipe_auth_token';
const USER_DATA_COOKIE = 'workswipe_user_data';

// Token management
export const setAuthToken = (token: string) => {
  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_COOKIE);
};

export const removeAuthToken = () => {
  Cookies.remove(AUTH_TOKEN_COOKIE);
};

// User data management (for quick access without API calls)
export const setUserData = (user: any) => {
  if (user) {
    Cookies.set(USER_DATA_COOKIE, JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    }), {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
};

export const getUserData = () => {
  const userData = Cookies.get(USER_DATA_COOKIE);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
  Cookies.remove(USER_DATA_COOKIE);
};

// Clear all auth cookies
export const clearAuthCookies = () => {
  removeAuthToken();
  removeUserData();
};
