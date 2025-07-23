import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";

import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import { Avatar, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import axios from "axios";
import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pfp, setPfp] = useState("");
  const [userSettings, setUserSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function x() {
      if (!window.localStorage.getItem("authToken")) return;

      setLoggedIn(true);
      const username = window.localStorage.getItem("username");
      const authToken = window.localStorage.getItem("authToken"); 
      const response = await axios.get("/api/user", {
        params: { username: username, authToken }
      });
      setPfp(response.data.pfp);
    }
    x();
  }, []);

  return (
    <>
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
          {!loggedIn ? <Link href="/auth" title="login" className="text-white ml-4 text-xl font-semibold">login</Link> :
          
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                showFallback
                size="md"
                src={pfp}
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="profile"
                onPress={
                  () => {
                    router.push(`/users/${window.localStorage.getItem("username")}`);
                  }
                }
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                className="text-danger"
                color="danger"
                onPress={
                  () => {
                    window.localStorage.removeItem("username");
                    window.localStorage.removeItem("authToken");
                    router.push("/auth");
                  }
                }
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>}
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
    </>
  );
};
