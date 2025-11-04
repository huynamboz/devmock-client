import { LogOut, Github, Search, User, ArrowRight } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuthStore } from "@/stores/auth.store";

export const Navbar = () => {
  const navigate = useNavigate();
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
    <HeroUINavbar isBordered={true} maxWidth="xl" position="static" className="px-2 sm:px-4">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-2 sm:gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1 sm:gap-2 min-w-0"
            color="foreground"
            href="/"
          >
            <img
              alt="DevMock"
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              src="/assets/images/logo.png"
            />
            <p className="font-bold text-base sm:text-xl truncate">DevMock</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 xl:gap-6 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium text-sm",
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
        <NavbarItem className="hidden sm:flex gap-1 sm:gap-2">
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <Github className="text-default-500" size={18} />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        {!isAuthenticated && (
          <NavbarItem className="hidden md:flex">
            <Button
              color="primary"
              endContent={<ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              size="sm"
              className="text-xs sm:text-sm"
              onPress={() => navigate("/projects")}
            >
              Get Started
            </Button>
          </NavbarItem>
        )}
        {isAuthenticated && user && (
          <NavbarItem className="hidden sm:flex">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button
                  className="bg-default-100 text-xs sm:text-sm max-w-[120px] sm:max-w-none"
                  startContent={<User className="text-default-600" size={14} />}
                  variant="flat"
                  size="sm"
                >
                  <span className="truncate">
                    {user.name || user.email}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2 w-64">
                  <div className="flex flex-col gap-2">
                    <div className="px-2 py-1">
                      <p className="text-sm font-semibold text-default-900 truncate">
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

      <NavbarContent className="sm:hidden basis-1 pl-2" justify="end">
        <Link isExternal href={siteConfig.links.github} className="min-w-fit">
          <Github className="text-default-500" size={18} />
        </Link>
        <ThemeSwitch />
        {!isAuthenticated && (
          <Button
            color="primary"
            endContent={<ArrowRight className="h-3.5 w-3.5" />}
            size="sm"
            className="text-xs px-2"
            onPress={() => navigate("/projects")}
          >
            <span className="hidden xs:inline">Get Started</span>
            <span className="xs:hidden">Start</span>
          </Button>
        )}
        {isAuthenticated && user && (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                isIconOnly
                className="bg-default-100 min-w-fit"
                variant="flat"
                size="sm"
              >
                <User className="text-default-600" size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2 w-64">
                <div className="flex flex-col gap-2">
                  <div className="px-2 py-1">
                    <p className="text-sm font-semibold text-default-900 truncate">
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
        <NavbarMenuToggle className="min-w-fit" />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        {!isAuthenticated && (
          <div className="mx-4 mt-4 mb-4">
            <Button
              className="w-full"
              color="primary"
              endContent={<ArrowRight className="h-4 w-4" />}
              size="lg"
              onPress={() => navigate("/projects")}
            >
              Get Started
            </Button>
          </div>
        )}
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
