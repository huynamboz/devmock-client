import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { title } from "@/components/primitives";
import { GOOGLE_CLIENT_ID } from "@/config/api";
import { useAuthStore } from "@/stores/auth.store";
import DefaultLayout from "@/layouts/default";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme: string;
              size: string;
              text: string;
              width?: string;
            },
          ) => void;
        };
      };
    };
  }
}

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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setIsGoogleLoading(true);
      setError("");

      try {
        // response.credential is the ID token we need
        await googleLogin(response.credential);

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
    },
    [googleLogin, location, navigate],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return;
    }

    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: "100%",
        });
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initializeGoogleSignIn();

      return;
    }

    // Load Google Identity Services script
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      // Wait for script to load
      existingScript.addEventListener("load", initializeGoogleSignIn);

      return () => {
        existingScript.removeEventListener("load", initializeGoogleSignIn);
      };
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = initializeGoogleSignIn;

    document.body.appendChild(script);

    // Don't remove script on cleanup as it may be used by other components
  }, [handleGoogleCredentialResponse]);

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

                <div className="w-full">
                  <div ref={googleButtonRef} className="flex justify-center" />
                  {isGoogleLoading && (
                    <div className="mt-2 text-sm text-center text-default-500">
                      Signing in with Google...
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
