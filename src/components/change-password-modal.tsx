import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { authService } from "@/services/auth.service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");

      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");

      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password.");

      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await authService.changePassword({
        oldPassword,
        newPassword,
      });

      addToast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
        color: "success",
        variant: "flat",
      });

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: {
            status?: number;
            data?: {
              message?: string;
            };
          };
        };

        const status = axiosError.response?.status;
        const message =
          axiosError.response?.data?.message || "Failed to change password.";

        if (status === 400) {
          setError(
            "Password change is only available for local accounts. Google users cannot change password here.",
          );
        } else if (status === 401) {
          setError("Old password is incorrect. Please try again.");
        } else if (status === 404) {
          setError("User not found. Please try logging in again.");
        } else {
          setError(message);
        }
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to change password.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Change Password</h2>
            </div>
            <p className="text-sm text-default-600 font-normal">
              Enter your current password and choose a new one
            </p>
          </ModalHeader>
          <ModalBody>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
                >
                  {isOldPasswordVisible ? (
                    <EyeOff className="h-4 w-4 text-default-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-400" />
                  )}
                </button>
              }
              label="Current Password"
              placeholder="Enter your current password"
              size="lg"
              type={isOldPasswordVisible ? "text" : "password"}
              value={oldPassword}
              variant="bordered"
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                >
                  {isNewPasswordVisible ? (
                    <EyeOff className="h-4 w-4 text-default-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-400" />
                  )}
                </button>
              }
              label="New Password"
              placeholder="Enter your new password"
              size="lg"
              type={isNewPasswordVisible ? "text" : "password"}
              value={newPassword}
              variant="bordered"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              isRequired
              classNames={{
                inputWrapper: "border-default-200",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff className="h-4 w-4 text-default-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-400" />
                  )}
                </button>
              }
              label="Confirm New Password"
              placeholder="Confirm your new password"
              size="lg"
              type={isConfirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              variant="bordered"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              isDisabled={isLoading}
              variant="light"
              onPress={handleClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

