import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { title } from "@/components/primitives";
import { useAuthStore } from "@/stores/auth.store";
import DefaultLayout from "@/layouts/default";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");

      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name || undefined);

      // After successful registration, redirect to home
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
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
            <h1 className={title({ size: "lg" })}>Create Account</h1>
            <p className="text-default-600 mt-2">
              Join MockAPI and start building with powerful mock APIs in
              minutes.
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
              label="Full Name"
              placeholder="Enter your full name"
              size="lg"
              type="text"
              value={name}
              variant="bordered"
              onChange={(e) => setName(e.target.value)}
            />

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

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              label="Confirm Password"
              placeholder="Confirm your password"
              size="lg"
              type="password"
              value={confirmPassword}
              variant="bordered"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex items-center">
              <input
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                id="terms"
                type="checkbox"
              />
              <label
                className="ml-2 block text-sm text-default-600"
                htmlFor="terms"
              >
                I agree to the{" "}
                <Link className="text-primary hover:underline" href="/terms">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-primary hover:underline" href="/privacy">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-default-600">
                Already have an account?{" "}
                <Link
                  className="text-primary hover:underline font-medium"
                  href="/login"
                >
                  Get Started
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}
