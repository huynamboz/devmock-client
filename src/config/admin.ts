import type { LucideIcon } from "lucide-react";

import { LayoutDashboard, Mic, Settings, HelpCircle, Code } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  action?: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const adminConfig = {
  name: "Vocatee",
  navSections: [
    {
      title: "GENERAL",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Speaking", href: "/admin/speaking", icon: Mic },
        { label: "Development", href: "/admin/dev", icon: Code },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
        { label: "Help", href: "/admin/help", icon: HelpCircle },
      ],
    },
  ] as AdminNavSection[],
  // Keep flat navItems for backward compat
  navItems: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Speaking", href: "/admin/speaking", icon: Mic },
  ] as AdminNavItem[],
};
