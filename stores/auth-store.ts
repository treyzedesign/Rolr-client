"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { loginUser, registerJobSeeker, getCurrentUser, verifyEmail, resendOtp, forgotPassword, resetPassword, changePassword } from "@/lib/api/auth";
import { registerEmployer } from "@/lib/api/auth";
import type { EmployerRegisterRequest, JobSeekerRegisterRequest, LoginRequest, VerifyEmailRequest, ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from "@/types/auth";
import type { AuthUser } from "@/types/auth";
import { 
  setAuthToken, 
  getAuthToken, 
  removeAuthToken,
  setUserData,
  getUserData,
  clearAuthCookies
} from "@/lib/cookies";
import { getUserFromToken, isTokenExpired } from "@/lib/jwt";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  registerJobSeeker: (payload: JobSeekerRegisterRequest) => Promise<void>;
  registerEmployer: (payload: EmployerRegisterRequest) => Promise<void>;
  verifyEmail: (payload: VerifyEmailRequest) => Promise<void>;
  resendOtp: (payload: ResendOtpRequest) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  logout: () => void;
  hydrateAuthState: () => void;
  fetchCurrentUser: () => Promise<AuthUser | null>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      async login(payload) {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(payload);
          
          // Store token and user data in cookies
          setAuthToken(response.token);
          setUserData(response.user);
          
          set({
            token: response.token,
            user: response.user,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
          toast.error(errorMessage);
          set({ 
            isLoading: false, 
            error: errorMessage,
            token: null,  // clear stale token on failed login
            user: null,   // clear stale user on failed login
          });
        }
      },
      async registerEmployer(payload) {
        set({ isLoading: true, error: null });
        try {
          await registerEmployer(payload);
          set({ isLoading: false });
          // Registration successful, redirect to OTP verification
          window.location.href = `/verify-otp?email=${encodeURIComponent(payload.email)}`;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message;
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("REGISTER_FAILED");
        }
      },
      async registerJobSeeker(payload) {
        set({ isLoading: true, error: null });
        try {
          await registerJobSeeker(payload);
          set({ isLoading: false });
          // Registration successful, redirect to OTP verification
          window.location.href = `/verify-otp?email=${encodeURIComponent(payload.email)}`;
        } catch (error: any) {
          console.log(error.response?.data?.message);
          
          const errorMessage = error.response?.data?.message;
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("REGISTER_FAILED");
        }
      },
      async verifyEmail(payload) {
        set({ isLoading: true, error: null });
        try {
          const response = await verifyEmail(payload);
          
          // Store token and user data in cookies
          setAuthToken(response.token);
          setUserData(response.user);
          
          set({
            token: response.token,
            user: response.user,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Invalid or expired OTP. Please try again.";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("VERIFY_FAILED");
        }
      },
      async resendOtp(payload) {
        set({ isLoading: true, error: null });
        try {
          await resendOtp(payload);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Unable to resend OTP. Please try again.";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("RESEND_FAILED");
        }
      },
      async forgotPassword(payload) {
        set({ isLoading: true, error: null });
        try {
          await forgotPassword(payload);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Unable to send reset code. Please try again.";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("FORGOT_PASSWORD_FAILED");
        }
      },
      async resetPassword(payload) {
        set({ isLoading: true, error: null });
        try {
          await resetPassword(payload);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Unable to reset password. Please try again.";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("RESET_PASSWORD_FAILED");
        }
      },
      async changePassword(payload) {
        set({ isLoading: true, error: null });
        try {
          await changePassword(payload);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Unable to change password. Please try again.";
          toast.error(errorMessage);
          set({ isLoading: false });
          throw new Error("CHANGE_PASSWORD_FAILED");
        }
      },
      async fetchCurrentUser() {
        // First try to get user from cookie
        const token = getAuthToken();
        if (!token) return null;
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          clearAuthCookies();
          set({ token: null, user: null });
          return null;
        }
        
        // Try to get user from cookie first
        const userData = getUserData();
        if (userData) {
          set({ user: userData });
          return userData;
        }
        
        // If no user in cookie, fetch from API
        try {
          const user = await getCurrentUser();
          setUserData(user);
          set({ user });
          return user;
        } catch (error) {
          clearAuthCookies();
          set({ token: null, user: null });
          return null;
        }
      },
      logout() {
        clearAuthCookies();
        set({ token: null, user: null, error: null });
      },
      hydrateAuthState() {
        // Initialize auth state from cookies
        const token = getAuthToken();
        const userData = getUserData();
        
        if (token && userData && !isTokenExpired(token)) {
          set({ token, user: userData });
        } else {
          // Clear invalid/expired data
          clearAuthCookies();
          set({ token: null, user: null });
        }
      },
      setError(error) {
        set({ error });
      },
    }),
    {
      name: "workswipe-auth",
      storage: createJSONStorage(() => localStorage), // Keep for UI state persistence
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    },
  ),
);
