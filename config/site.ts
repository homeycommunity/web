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
      title: "Roadmap",
      href: "/roadmap",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
}
