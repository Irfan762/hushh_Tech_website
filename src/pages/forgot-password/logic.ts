import { useState, useCallback } from "react";
import config from "../../resources/config/config";

export const useForgotPasswordLogic = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = config.supabaseClient;
    if (!supabase) {
      setError("Authentication is not configured correctly.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("[ForgotPassword] Error:", err);
      setError(err instanceof Error ? err.message : "Unable to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading]);

  return {
    email,
    setEmail,
    isLoading,
    error,
    success,
    handleResetPassword,
  };
};
