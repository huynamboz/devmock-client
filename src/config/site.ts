export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "DevMock",
  description:
    "A lightweight mock backend + mock database built for Frontend Developers. Create data models, generate mock data, and call real REST APIs instantly while focusing entirely on UI development.",
  navItems: [
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Projects",
      href: "/projects",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/huynamboz",
  },
};
