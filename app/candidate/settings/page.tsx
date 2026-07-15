"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { Bell, Shield, Eye, EyeOff, Loader2, Check, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function CandidateSettings() {
  const { changePassword, user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  const [activeTab, setActiveTab] = useState<"password" | "notifications" | "privacy">("password");
  
  // Forms and validation state
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

  // Interactive toggle states
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    recommendations: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    dataSharing: false,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      /[A-Z]/.test(newPassword) && 
      /[a-z]/.test(newPassword) && 
      /[0-9]/.test(newPassword) && 
      /[^A-Za-z0-9]/.test(newPassword) && 
      confirmPassword.trim() &&
      newPassword === confirmPassword
    );
  };

  const handlePasswordUpdate = async () => {
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = (type: "email" | "push" | "recommendations") => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    toast.success("Notification preferences updated");
  };

  const togglePrivacy = (type: "profileVisibility" | "dataSharing") => {
    setPrivacy(prev => ({ ...prev, [type]: !prev[type] }));
    toast.success("Privacy settings updated");
  };

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching designs */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account settings and preferences.
          </p>
        </div>
        
        {/* Top-Right Profile Widget */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {candidateProfile?.profile_image_url ? (
                <img 
                  src={candidateProfile.profile_image_url} 
                  alt="avatar" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                candidateName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Candidate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto w-full">
        
        {/* Left Side Menu - Tabs */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-2 select-none">
          {/* 1. Change Password Tab */}
          <button
            onClick={() => setActiveTab("password")}
            className={`flex w-full items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent ${
              activeTab === "password"
                ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-100/50 dark:border-blue-900/25 text-blue-600 dark:text-blue-400"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src="/Assets/key-square.png"
                alt="Key"
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm font-semibold">Change Password</span>
            </div>
            <span className={`text-lg font-light ${activeTab === 'password' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>&rarr;</span>
          </button>

          {/* 2. Notification Preference Tab */}
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex w-full items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent ${
              activeTab === "notifications"
                ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-100/50 dark:border-blue-900/25 text-blue-600 dark:text-blue-400"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`} />
              <span className="text-sm font-semibold">Notification Preference</span>
            </div>
            <span className={`text-lg font-light ${activeTab === 'notifications' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>&rarr;</span>
          </button>

          {/* 3. Privacy & Data Tab */}
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex w-full items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent ${
              activeTab === "privacy"
                ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-100/50 dark:border-blue-900/25 text-blue-600 dark:text-blue-400"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850"
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${activeTab === 'privacy' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`} />
              <span className="text-sm font-semibold">Privacy & Data</span>
            </div>
            <span className={`text-lg font-light ${activeTab === 'privacy' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>&rarr;</span>
          </button>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150/75 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.015)] min-h-[400px]">
          
          {/* TAB 1: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Change Password
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 select-none">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password requirements visual validation list */}
                  {newPassword && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1.5 select-none border border-slate-100/50 dark:border-slate-800/40">
                      <div className="flex items-center text-[10px] font-bold">
                        <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>✓</span>
                        <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-slate-500'}>At least one uppercase letter</span>
                      </div>
                      <div className="flex items-center text-[10px] font-bold">
                        <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>✓</span>
                        <span className={passwordValidation.hasLowercase ? 'text-green-600' : 'text-slate-500'}>At least one lowercase letter</span>
                      </div>
                      <div className="flex items-center text-[10px] font-bold">
                        <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>✓</span>
                        <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-slate-500'}>At least one number</span>
                      </div>
                      <div className="flex items-center text-[10px] font-bold">
                        <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.hasSymbol ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>✓</span>
                        <span className={passwordValidation.hasSymbol ? 'text-green-600' : 'text-slate-500'}>At least one symbol</span>
                      </div>
                      <div className="flex items-center text-[10px] font-bold">
                        <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.isValidLength ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>✓</span>
                        <span className={passwordValidation.isValidLength ? 'text-green-600' : 'text-slate-500'}>At least 8 characters</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${
                        confirmPassword && !passwordValidation.passwordsMatch
                          ? 'border-red-300 bg-red-50/50 dark:border-red-600/30 dark:bg-red-950/20'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-2 flex items-center text-[10px] font-bold select-none">
                      <span className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-white ${passwordValidation.passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`}>
                        {passwordValidation.passwordsMatch ? '✓' : '✗'}
                      </span>
                      <span className={passwordValidation.passwordsMatch ? 'text-green-600' : 'text-red-500'}>
                        {passwordValidation.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={isLoading || !currentPassword || !isPasswordValid()}
                className="w-full py-3.5 mt-6 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 border-none"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          )}

          {/* TAB 2: NOTIFICATION PREFERENCES */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Notification Preference
              </h2>

              <div className="space-y-4">
                {/* 1. Email Notification */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:bg-slate-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">Email Notification</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Receive email update about your application</p>
                  </div>
                  <div 
                    onClick={() => toggleNotification("email")}
                    className="flex-shrink-0"
                  >
                    {notifications.email ? (
                      <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center text-white border border-blue-500 cursor-pointer shadow-sm">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-md bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* 2. Push Notification */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:bg-slate-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">Push Notification</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Get instant update on your device</p>
                  </div>
                  <div 
                    onClick={() => toggleNotification("push")}
                    className="flex-shrink-0"
                  >
                    {notifications.push ? (
                      <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center text-white border border-blue-500 cursor-pointer shadow-sm">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-md bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* 3. Job Recommendations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:bg-slate-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">Job Recommendations</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Receive personalized job suggestions</p>
                  </div>
                  <div 
                    onClick={() => toggleNotification("recommendations")}
                    className="flex-shrink-0"
                  >
                    {notifications.recommendations ? (
                      <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center text-white border border-blue-500 cursor-pointer shadow-sm">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-md bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & DATA */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Privacy & Data
              </h2>

              <div className="space-y-4">
                {/* 1. Profile Visibility */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:bg-slate-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">Profile Visibility</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Make your profile visible to employers</p>
                  </div>
                  <div
                    onClick={() => togglePrivacy("profileVisibility")}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                      privacy.profileVisibility ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        privacy.profileVisibility ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Data Sharing */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:bg-slate-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">Data Sharing</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Share data with trusted partners</p>
                  </div>
                  <div
                    onClick={() => togglePrivacy("dataSharing")}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                      privacy.dataSharing ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        privacy.dataSharing ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
