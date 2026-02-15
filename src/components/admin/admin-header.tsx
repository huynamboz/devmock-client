import { Menu, Search, Bell, Lock } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { useDisclosure } from "@heroui/modal";

import { ThemeSwitch } from "@/components/theme-switch";
import { useAuthStore } from "@/stores/auth.store";
import { ChangePasswordModal } from "@/components/change-password-modal";

export interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const {
    isOpen: isChangePasswordOpen,
    onOpen: onChangePasswordOpen,
    onClose: onChangePasswordClose,
  } = useDisclosure();

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-default-200 bg-white px-4 dark:border-default-100 dark:bg-default-50 md:px-6">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          isIconOnly
          aria-label="Toggle sidebar"
          className="lg:hidden"
          radius="sm"
          size="sm"
          variant="light"
          onPress={onMenuClick}
        >
          <Menu className="size-5 text-default-600" />
        </Button>

        <div className="hidden sm:block w-full max-w-sm">
          <Input
            classNames={{
              base: "h-9",
              inputWrapper:
                "h-9 bg-default-100 dark:bg-default-50 border border-default-200 shadow-none",
              input: "text-sm",
            }}
            placeholder="Search"
            radius="lg"
            startContent={<Search className="size-4 text-default-400" />}
            type="search"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <ThemeSwitch />

        <Button
          isIconOnly
          aria-label="Notifications"
          radius="full"
          size="sm"
          variant="light"
        >
          <Bell className="size-[18px] text-default-500" />
        </Button>

        {user && (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <button className="ml-2 outline-none" type="button">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground cursor-pointer">
                  {(user.name || user.email || "A").charAt(0).toUpperCase()}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2 w-56">
                <div className="flex flex-col gap-2">
                  <div className="px-2 py-1">
                    <p className="text-sm font-semibold text-default-900 truncate">
                      {user.name || "Admin"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-default-500 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  {user.provider === "LOCAL" && (
                    <>
                      <div className="border-t border-default-200" />
                      <Button
                        className="justify-start"
                        color="default"
                        size="sm"
                        startContent={
                          <Lock className="text-default-500" size={16} />
                        }
                        variant="light"
                        onPress={onChangePasswordOpen}
                      >
                        Change Password
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={onChangePasswordClose}
        />
      </div>
    </header>
  );
}
