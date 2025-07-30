import { FC, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";
import { useState, useEffect } from "react";

export const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900"
    >
      {theme === "dark" ? <SunFilledIcon /> : <MoonFilledIcon />}
    </button>
  );
};
