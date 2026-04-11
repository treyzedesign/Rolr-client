// Simple JWT decoder (for client-side only)
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Assume expired if we can't decode
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getUserFromToken = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  
  return {
    id: decoded.user_id,
    email: decoded.email,
    role: decoded.role,
    exp: decoded.exp,
    iat: decoded.iat
  };
};
