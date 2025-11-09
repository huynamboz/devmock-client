import type { CredentialResponse } from "@react-oauth/google";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { title } from "@/components/primitives";
import { GOOGLE_CLIENT_ID } from "@/config/api";
import { useAuthStore } from "@/stores/auth.store";
import DefaultLayout from "@/layouts/default";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const navigate = useNavigate();
  const location = useLocation();

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

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-default-200" />
                  <span className="text-sm text-default-500">OR</span>
                  <div className="flex-1 h-px bg-default-200" />
                </div>

                <div className="w-full flex justify-center">
                  <GoogleLogin
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                    theme="outline"
                    useOneTap={false}
                    width="100%"
                    onError={handleGoogleError}
                    onSuccess={handleGoogleSuccess}
                  />
                </div>
                {isGoogleLoading && (
                  <div className="mt-2 text-sm text-center text-default-500">
                    Signing in with Google...
                  </div>
                )}
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
