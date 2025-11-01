import {
  LogOut,
  Github,
  Twitter,
  MessageCircle,
  Heart,
  Search,
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
    <HeroUINavbar maxWidth="xl" position="static">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit">ACME</p>
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
          <NavbarItem className="hidden sm:flex gap-2 items-center">
            <span className="text-sm text-default-600">
              {user.name || user.email}
            </span>
            <Button
              className="text-sm font-normal text-default-600 bg-default-100"
              startContent={<LogOut className="text-default-500" size={16} />}
              variant="flat"
              onPress={handleLogout}
            >
              Logout
            </Button>
          </NavbarItem>
        )}
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<Heart className="text-danger" size={16} />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <Github className="text-default-500" size={20} />
        </Link>
        <ThemeSwitch />
        {isAuthenticated && user && (
          <Button
            isIconOnly
            className="text-sm font-normal text-default-600 bg-default-100 min-w-fit px-2"
            variant="flat"
            onPress={handleLogout}
          >
            <LogOut className="text-default-500" size={20} />
          </Button>
        )}
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        {isAuthenticated && user && (
          <div className="mx-4 mt-2 mb-2 pb-2 border-b border-default-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">
                {user.name || user.email}
              </span>
              <Button
                className="text-sm font-normal text-default-600 bg-default-100"
                size="sm"
                startContent={<LogOut className="text-default-500" size={16} />}
                variant="flat"
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
