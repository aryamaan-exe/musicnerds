import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";

import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="bg-secondary">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-center items-center gap-1" href="/">
            <p className="text-4xl" id="logo">musicnerds</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center">
          <div className="hidden lg:flex gap-4 justify-center">
              {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-semibold font-semibold text-xl",
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
            
          </div>
        </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link href="/auth" title="login" className="text-white ml-4 text-xl font-semibold">login</Link>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
