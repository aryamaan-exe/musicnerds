export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Musicnerds",
  description: "Catalog all your music",
  navItems: [
    {
      label: "recs",
      href: "/recs",
    },
    {
      label: "featured",
      href: "/featured",
    },
    {
      label: "for you",
      href: "/fyp",
    },
  ],
  links: {
    github: "https://github.com/aryamaan-exe",
    discord: "https://discord.com/users/866023101725016114",
  },
};
