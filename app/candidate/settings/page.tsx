"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";

export default function CandidateSettings() {
  const { changePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    isValidLength: false,
    passwordsMatch: false
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'currentPassword') {
      setCurrentPassword(value);
    } else if (field === 'newPassword') {
      setNewPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Real-time password validation for new password
    if (field === 'newPassword' || field === 'confirmPassword') {
      const password = field === 'newPassword' ? value : newPassword;
      const confirmPwd = field === 'confirmPassword' ? value : confirmPassword;
      
      setPasswordValidation({
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSymbol: /[^A-Za-z0-9]/.test(password),
        isValidLength: password.length >= 8,
        passwordsMatch: password === confirmPwd && password.length > 0
      });
    }
  };

  const isPasswordValid = () => {
    return (
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) && // hasUppercase
      /[a-z]/.test(newPassword) && // hasLowercase
      /[0-9]/.test(newPassword) && // hasNumber
      /[^A-Za-z0-9]/.test(newPassword) && // hasSymbol
      confirmPassword.trim() &&
      newPassword === confirmPassword
    );
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password must meet all requirements");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      toast.success("Password updated successfully");
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Enter new password (min. 8 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Password Requirements */}
          {newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.hasUppercase ? '✓' : '○'}
                </span>
                <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                  At least one uppercase letter
                </span>
              </div>
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.hasLowercase ? '✓' : '○'}
                </span>
                <span className={passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                  At least one lowercase letter
                </span>
              </div>
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.hasNumber ? '✓' : '○'}
                </span>
                <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                  At least one number
                </span>
              </div>
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.hasSymbol ? '✓' : '○'}
                </span>
                <span className={passwordValidation.hasSymbol ? 'text-green-600' : 'text-gray-500'}>
                  At least one symbol
                </span>
              </div>
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.isValidLength ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.isValidLength ? '✓' : '○'}
                </span>
                <span className={passwordValidation.isValidLength ? 'text-green-600' : 'text-gray-500'}>
                  At least 8 characters
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                  confirmPassword && !passwordValidation.passwordsMatch
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                    : ''
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Password Match Validation */}
          {confirmPassword && (
            <div className="mt-1">
              <div className="flex items-center text-xs">
                <span className={`mr-2 ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordValidation.passwordsMatch ? '✓' : '✗'}
                </span>
                <span className={passwordValidation.passwordsMatch ? 'text-green-600' : 'text-red-600'}>
                  {passwordValidation.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePasswordUpdate}
            disabled={isLoading || !currentPassword || !isPasswordValid()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive email updates about your applications</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get instant updates on your device</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-slate-700">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Job Recommendations</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive personalized job suggestions</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Profile Visibility</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Make your profile visible to employers</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Data Sharing</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Share data with trusted partners</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-slate-700">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Download My Data
          </button>
          <button className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
