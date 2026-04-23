/**
 * Signup Page — All Business Logic
 *
 * Contains:
 * - Auth session check & redirect
 * - OAuth sign-up handlers (Apple, Google)
 * - Loading state management
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../resources/config/config";
import {
  redirectToUrl,
  resolveOAuthHost,
} from "../../auth/authHost";
import type { OAuthStartResult } from "../../auth/session";
import { DEFAULT_AUTH_REDIRECT, sanitizeInternalRedirect } from "../../utils/security";
import { useAuthSession } from "../../auth/AuthSessionProvider";
import { normalizeLegacyOnboardingRedirectTarget } from "../../services/onboarding/flow";

/* ─── Types ─── */
export interface SignupLogic {
  isLoading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  authFallbackUrl: string | null;
  signupSuccess: boolean;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleAppleSignIn: () => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  handleEmailSignup: (e: React.FormEvent) => Promise<void>;
}

/* ─── Main Hook ─── */
export const useSignupLogic = (): SignupLogic => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authFallbackUrl, setAuthFallbackUrl] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { status, startOAuth } = useAuthSession();

  const hostResolution = useMemo(
    () =>
      resolveOAuthHost(
        window.location.pathname,
        window.location.search,
        config.redirect_url,
        window.location.origin
      ),
    []
  );
  const shouldRedirectToSupportedHost = !hostResolution.supported;

  // Stable redirect path — computed once from URL params
  const { redirectPath, sanitizedRedirectPath } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const sanitized = sanitizeInternalRedirect(
      params.get("redirect"),
      DEFAULT_AUTH_REDIRECT
    );
    return {
      sanitizedRedirectPath: sanitized,
      redirectPath: normalizeLegacyOnboardingRedirectTarget(sanitized),
    };
  }, []);

  useEffect(() => {
    if (status !== "booting") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      console.warn("[Signup] Auth session is still booting", {
        pathname: window.location.pathname,
        search: window.location.search,
      });
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  useEffect(() => {
    if (shouldRedirectToSupportedHost) {
      redirectToUrl(hostResolution.canonicalEntryUrl);
    }
  }, [hostResolution.canonicalEntryUrl, shouldRedirectToSupportedHost]);

  useEffect(() => {
    if (
      shouldRedirectToSupportedHost ||
      redirectPath === sanitizedRedirectPath
    ) {
      return;
    }

    navigate(
      `${window.location.pathname}?redirect=${encodeURIComponent(redirectPath)}`,
      { replace: true }
    );
  }, [navigate, redirectPath, sanitizedRedirectPath, shouldRedirectToSupportedHost]);

  /* Auth session listener — redirect if already logged in */
  useEffect(() => {
    if (shouldRedirectToSupportedHost) {
      return;
    }

    if (status === "authenticated") {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, shouldRedirectToSupportedHost, status]);

  const handleOAuthFailure = useCallback(
    (result: Extract<OAuthStartResult, { ok: false }>) => {
      setIsSigningIn(false);
      if (result.reason === "unsupported_host" && result.redirectTo) {
        redirectToUrl(result.redirectTo);
        return;
      }

      setAuthError(result.message);
      setAuthFallbackUrl(result.redirectTo || null);
    },
    []
  );

  /* Apple OAuth — prevent double-clicks */
  const handleAppleSignIn = useCallback(async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    setAuthFallbackUrl(null);
    const result = await startOAuth("apple");
    if (!result.ok) {
      handleOAuthFailure(result);
    }
  }, [handleOAuthFailure, isSigningIn, startOAuth]);

  /* Google OAuth — prevent double-clicks */
  const handleGoogleSignIn = useCallback(async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    setAuthFallbackUrl(null);
    const result = await startOAuth("google");
    if (!result.ok) {
      handleOAuthFailure(result);
    }
  }, [handleOAuthFailure, isSigningIn, startOAuth]);

  const handleEmailSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSigningIn) return;

      if (!email || !password || !confirmPassword) {
        setAuthFallbackUrl(null);
        setAuthError("Please fill in all fields.");
        return;
      }

      if (password !== confirmPassword) {
        setAuthFallbackUrl(null);
        setAuthError("Passwords do not match.");
        return;
      }

      setIsSigningIn(true);
      setAuthError(null);
      setAuthFallbackUrl(null);

      const supabase = config.supabaseClient;
      if (!supabase) {
        setAuthError("Authentication is not configured correctly.");
        setIsSigningIn(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setAuthError(error.message);
        } else if (!data.session) {
          // Email confirmation required — no session yet
          setSignupSuccess(true);
        }
        // If session exists, the auth listener will redirect automatically
      } catch (error) {
        console.error("[Signup] Email signup failed:", error);
        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to sign up right now. Please try again."
        );
      } finally {
        setIsSigningIn(false);
      }
    },
    [email, password, confirmPassword, isSigningIn]
  );

  return {
    isLoading: status === "booting" || shouldRedirectToSupportedHost,
    isSigningIn,
    authError,
    authFallbackUrl,
    signupSuccess,
    handleAppleSignIn,
    handleGoogleSignIn,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleEmailSignup,
  };
};
