import React from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordLogic } from "./logic";
import HushhTechCta from "../../components/hushh-tech-header/HushhTechCta";
import { HushhTechCtaVariant } from "../../components/hushh-tech-header/HushhTechCta";

const ForgotPasswordPage: React.FC = () => {
  const { email, setEmail, isLoading, error, success, handleResetPassword } = useForgotPasswordLogic();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-8">
        {/* ── Header ── */}
        <section className="text-center space-y-2">
          <h1 className="text-[32px] font-bold tracking-tight text-gray-900 font-playfair">
            Reset your password
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </section>

        {/* ── Success State ── */}
        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-green-800 font-semibold">Check your email</p>
              <p className="text-green-700 text-sm">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
              </p>
            </div>
            <Link to="/login" className="inline-block text-sm font-medium text-green-800 hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1.5">
              <label 
                htmlFor="reset-email"
                className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200/60 rounded-xl focus:bg-white focus:border-hushh-blue focus:ring-4 focus:ring-hushh-blue/5 outline-none transition-all text-[15px] placeholder:text-gray-300"
                placeholder="name@email.com"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <HushhTechCta
              variant={HushhTechCtaVariant.BLACK}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending Link..." : "Send Reset Link"}
            </HushhTechCta>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-medium text-hushh-blue hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
