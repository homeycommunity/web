export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Homey Community Space",
  description:
    "Homey Community Space is a place for Homey users to share their experiences, ideas and questions.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Store",
      href: "/store",
    },
    {
      title: "My Homeys",
      href: "/control/homeys",
      needsAuth: true,
    },
    {
      title: "Download",
      href: "/download",
    },
    {
      title: "API Docs",
      href: "/docs/api",
      disabled: true,
    },
  ],
  links: {
    discord: "/discord",
    github: "https://github.com/homeycommunity",
  },
}
