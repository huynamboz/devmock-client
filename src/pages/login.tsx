import type { CredentialResponse } from "@react-oauth/google";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { title } from "@/components/primitives";
import { GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from "@/config/api";
import { useAuthStore } from "@/stores/auth.store";
import { getGitHubAuthUrl } from "@/utils/github-oauth";
import DefaultLayout from "@/layouts/default";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const githubLogin = useAuthStore((state) => state.githubLogin);
  const navigate = useNavigate();
  const location = useLocation();
  const googleLoginRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      setError("Google login failed. No credential received.");

      return;
    }

    setIsGoogleLoading(true);
    setError("");

    try {
      // credentialResponse.credential is the ID token we need
      await googleLogin(credentialResponse.credential);

      // Redirect to the page user was trying to access, or home page
      const from =
        (location.state as { from?: Location })?.from?.pathname || "/";

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed. Please try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
    setIsGoogleLoading(false);
  };

  const handleGoogleButtonClick = () => {
    // Trigger click on hidden GoogleLogin button
    const googleButton = googleLoginRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement;

    if (googleButton) {
      googleButton.click();
    }
  };

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const githubError = searchParams.get("error");

    if (githubError) {
      setError(`GitHub login failed: ${githubError}`);
      // Clean up URL
      navigate("/login", { replace: true });

      return;
    }

    if (code) {
      handleGitHubCallback(code);
    }
  }, [searchParams]);

  const handleGitHubCallback = async (_code: string) => {
    setIsGitHubLoading(true);
    setError("");

    try {
      // Exchange code for access token via backend endpoint
      // The backend should have an endpoint: POST /api/v1/auth/github/callback
      // that exchanges the code for access token using client_secret
      try {
        const response = await apiClient.post<{ accessToken: string }>(
          "/auth/github/callback",
          { code: _code },
        );
        const accessToken = response.data.accessToken;

        // Use the access token to login
        await githubLogin(accessToken);

        // Redirect to the page user was trying to access, or home page
        const from =
          (location.state as { from?: Location })?.from?.pathname || "/";

        navigate(from, { replace: true });
      } catch (apiError) {
        // If backend endpoint doesn't exist, show helpful error message
        if (
          (apiError instanceof Error && apiError.message.includes("404")) ||
          (apiError instanceof Error && apiError.message.includes("Not Found"))
        ) {
          throw new Error(
            "GitHub OAuth callback endpoint not found. Please implement POST /api/v1/auth/github/callback endpoint on your backend to exchange the code for access token.",
          );
        }
        throw apiError;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "GitHub login failed. Please try again.",
      );
      // Clean up URL
      // navigate("/login", { replace: true });
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError("GitHub OAuth is not configured.");

      return;
    }

    setError("");
    setIsGitHubLoading(true);

    try {
      const redirectUri = `${window.location.origin}/login`;
      const authUrl = getGitHubAuthUrl(redirectUri);

      window.location.href = authUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate GitHub login.",
      );
      setIsGitHubLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);

      // Redirect to the page user was trying to access, or home page
      const from =
        (location.state as { from?: Location })?.from?.pathname || "/";

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="px-4 flex flex-auto flex-col items-center justify-center min-h-[60vh] h-full py-8 md:py-16 background-grid">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className={title({ size: "lg" })}>Get Started</h1>
            <p className="text-default-600 mt-2">
              Access your dashboard and start building with mock APIs.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              label="Email"
              placeholder="Enter your email"
              size="lg"
              type="email"
              value={email}
              variant="bordered"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              label="Password"
              placeholder="Enter your password"
              size="lg"
              type="password"
              value={password}
              variant="bordered"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  id="remember"
                  type="checkbox"
                />
                <label
                  className="ml-2 block text-sm text-default-600"
                  htmlFor="remember"
                >
                  Remember me
                </label>
              </div>

              <Link
                className="text-sm text-primary hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Login
            </Button>

            {(GOOGLE_CLIENT_ID || GITHUB_CLIENT_ID) && (
              <>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-default-200" />
                  <span className="text-sm text-default-500">OR</span>
                  <div className="flex-1 h-px bg-default-200" />
                </div>

                <div className="space-y-3">
                  {GOOGLE_CLIENT_ID && (
                    <>
                      {/* Hidden GoogleLogin for programmatic trigger */}
                      <div ref={googleLoginRef} className="hidden">
                        <GoogleLogin
                          useOneTap={false}
                          onError={handleGoogleError}
                          onSuccess={handleGoogleSuccess}
                        />
                      </div>

                      <Button
                        className="w-full"
                        color="default"
                        isLoading={isGoogleLoading}
                        size="lg"
                        variant="bordered"
                        onClick={handleGoogleButtonClick}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    </>
                  )}

                  {GITHUB_CLIENT_ID && (
                    <Button
                      className="w-full"
                      color="default"
                      isLoading={isGitHubLoading}
                      size="lg"
                      variant="bordered"
                      onClick={handleGitHubLogin}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                          fillRule="evenodd"
                        />
                      </svg>
                      Continue with GitHub
                    </Button>
                  )}

                  {(isGoogleLoading || isGitHubLoading) && (
                    <div className="mt-2 text-sm text-center text-default-500">
                      {isGoogleLoading && "Signing in with Google..."}
                      {isGitHubLoading && "Signing in with GitHub..."}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="text-center">
              <p className="text-sm text-default-600">
                Don&apos;t have an account?{" "}
                <Link
                  className="text-primary hover:underline font-medium"
                  href="/register"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}
