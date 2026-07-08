"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  const { verifyEmail, resendOtp, isLoading } = useAuthStore();

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      await verifyEmail({ email: email!, otp: otpValue });
      router.push("/login");
    } catch {
      setError("Invalid or expired OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !email) return;

    try {
      await resendOtp({ email });
      setCountdown(60);
      setCanResend(false);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      
      // Focus first input
      const firstInput = document.getElementById("otp-0") as HTMLInputElement;
      firstInput?.focus();
    } catch {
      setError("Unable to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col p-6 sm:p-10 relative font-sans">
      {/* Brand Logo at Top Left */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-[#2782FF]">
          Rolr
        </Link>
      </div>

      {/* Main card box container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[480px] bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-slate-100/50 flex flex-col animate-fadeIn">
          
          {/* Mail Icon badge at top */}
          <div className="mx-auto w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center p-3 mb-6 bg-white shadow-sm">
            <img 
              src="/Assets/mail_pic.png" 
              alt="Mail verification" 
              className="w-8 h-8 object-contain select-none pointer-events-none" 
            />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
            Code Verification
          </h1>
          
          <p className="mt-2 text-sm font-semibold text-slate-400 text-center leading-relaxed">
            We've sent a 6-digit code to <span className="text-[#2782FF] font-bold">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Input boxes container */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all focus:outline-none focus:ring-0 ${
                    focusedIndex === index || digit
                      ? "border-[#2782FF] bg-[#2782FF]/[0.01]"
                      : "border-transparent bg-[#f5f6f8]"
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left">
                <p className="text-xs font-semibold text-rose-600">{error}</p>
              </div>
            )}

            {/* Verify button */}
            <button
              type="submit"
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full py-4 mt-2 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </form>

          {/* Resend Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Didn't receive code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#2782FF] hover:underline font-bold transition-all ml-1"
                >
                  Resend
                </button>
              ) : (
                <span className="text-slate-400 font-semibold ml-1">
                  Resend in {formatTime(countdown)}
                </span>
              )}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col p-6 sm:p-10 relative font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2782FF]"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
