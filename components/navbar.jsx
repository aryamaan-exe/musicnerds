import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";

import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import { Avatar, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Drawer, Button, useDisclosure, DrawerContent, DrawerHeader, DrawerBody, ListboxItem, Listbox } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import axios from "axios";
import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function Hamburger() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>;

}

export const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pfp, setPfp] = useState("");
  const [username, setUsername] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    async function x() {
      if (!window.localStorage.getItem("authToken")) return;

      setLoggedIn(true);
      const username = window.localStorage.getItem("username");
      setUsername(username);
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
                    if (router.pathname === "/users/[username]") {
                      router.reload();
                    } else {
                      router.push(`/users/${username}`);
                    }
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

      <NavbarContent className="sm:hidden" justify="end">
        <NavbarItem>
          <Button isIconOnly color="secondary" onPress={onOpen}><Hamburger /></Button>
          <Drawer isOpen={isOpen} size="xs" onClose={onClose}>
            <DrawerContent>
              {(onClose) => (
                <>
                  <DrawerHeader className="flex flex-row gap-2 items-center">
                    <Avatar
                      showFallback
                      size="md"
                      src={pfp}
                    />
                    {username}
                  </DrawerHeader>
                  <DrawerBody>
                    <Listbox>
                      <ListboxItem onPress={() => {
                        console.log(router.pathname);
                        if (router.pathname === "/users/[username]") {
                          router.reload();
                        } else {
                          router.push(`/users/${username}`);
                        }
                      }}>Profile</ListboxItem>
                      <ListboxItem className="text-danger" onPress={
                        () => {
                          window.localStorage.removeItem("username");
                          window.localStorage.removeItem("authToken");
                          router.push("/auth");
                        }
                      }>Logout</ListboxItem>
                    </Listbox>
                  </DrawerBody>
                </>
              )}
            </DrawerContent>
          </Drawer>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
    </>
  );
};
