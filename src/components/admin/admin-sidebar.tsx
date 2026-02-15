import { NavLink, useLocation } from "react-router-dom";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { LogOut, Menu } from "lucide-react";
import clsx from "clsx";

import { adminConfig } from "@/config/admin";
import { useAuthStore } from "@/stores/auth.store";

const sidebarWidth = 256;

export interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          type="button"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-full flex flex-col",
          "w-[var(--admin-sidebar-width)] bg-[#1a1a2e] text-white",
          "transition-transform duration-200 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={
          {
            "--admin-sidebar-width": `${sidebarWidth}px`,
          } as React.CSSProperties
        }
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <NavLink
            className="flex items-center gap-2.5"
            to="/admin"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-lg font-semibold text-white">vocatee</span>
          </NavLink>
          <button
            className="rounded-md p-1 text-gray-400 transition-colors hover:text-white lg:hidden"
            type="button"
            onClick={onClose}
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* Nav sections */}
        <ScrollShadow className="-mr-1 flex-1 py-2 pr-1">
          {adminConfig.navSections.map((section) => (
            <div key={section.title} className="mb-2 px-4">
              <p className="mb-2 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </p>
              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.href}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
                      )}
                      to={item.href}
                      onClick={() => onClose?.()}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </ScrollShadow>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-400 transition-all duration-150 hover:bg-white/5 hover:text-gray-200"
            type="button"
            onClick={handleLogout}
          >
            <LogOut className="size-[18px] shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
