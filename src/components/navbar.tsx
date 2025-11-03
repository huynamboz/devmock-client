import {
  LogOut,
  Github,
  Twitter,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuthStore } from "@/stores/auth.store";

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <Search
          className="text-base text-default-400 pointer-events-none flex-shrink-0"
          size={16}
        />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar isBordered={true} maxWidth="xl" position="static">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <img
              alt="Mockpilot"
              className="w-6 h-6"
              src="/assets/images/logo.png"
            />
            <p className="font-bold text-inherit">DevMock</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <Twitter className="text-default-500" size={20} />
          </Link>
          <Link isExternal href={siteConfig.links.discord} title="Discord">
            <MessageCircle className="text-default-500" size={20} />
          </Link>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <Github className="text-default-500" size={20} />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        {isAuthenticated && user && (
          <NavbarItem className="hidden sm:flex">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button
                  className="bg-default-100"
                  startContent={<User className="text-default-600" size={16} />}
                  variant="flat"
                >
                  {user.name || user.email}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2 w-64">
                  <div className="flex flex-col gap-2">
                    <div className="px-2 py-1">
                      <p className="text-sm font-semibold text-default-900">
                        {user.name || "User"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-default-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div className="border-t border-default-200" />
                    <Button
                      className="justify-start"
                      color="danger"
                      size="sm"
                      startContent={
                        <LogOut className="text-default-500" size={16} />
                      }
                      variant="light"
                      onPress={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <Github className="text-default-500" size={20} />
        </Link>
        <ThemeSwitch />
        {isAuthenticated && user && (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                isIconOnly
                className="bg-default-100 min-w-fit"
                variant="flat"
              >
                <User className="text-default-600" size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2 w-64">
                <div className="flex flex-col gap-2">
                  <div className="px-2 py-1">
                    <p className="text-sm font-semibold text-default-900">
                      {user.name || "User"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-default-500 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-default-200" />
                  <Button
                    className="justify-start"
                    color="danger"
                    size="sm"
                    startContent={
                      <LogOut className="text-default-500" size={16} />
                    }
                    variant="light"
                    onPress={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        {isAuthenticated && user && (
          <div className="mx-4 mt-2 mb-2 pb-2 border-b border-default-200">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-default-900">
                {user.name || "User"}
              </p>
              {user.email && (
                <p className="text-xs text-default-500 truncate">
                  {user.email}
                </p>
              )}
              <Button
                className="justify-start mt-2"
                color="danger"
                size="sm"
                startContent={<LogOut className="text-default-500" size={16} />}
                variant="light"
                onPress={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        )}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
