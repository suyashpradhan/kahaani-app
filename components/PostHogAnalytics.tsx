"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnalytics, track } from "@/lib/analytics";

function surfaceFor(pathname: string) {
  if (pathname === "/") return "landing";
  if (pathname === "/create") return "create";
  if (pathname === "/memories") return "memory_shelf";
  if (pathname.startsWith("/story/")) return "story";
  if (pathname.startsWith("/memory/")) return "memory";
  if (pathname.startsWith("/create/")) return "host_status";
  return "other";
}

export function PostHogAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initializeAnalytics();
    const surface = surfaceFor(pathname);
    track("page_viewed", { surface });
    if (surface === "landing") track("landing_viewed");
  }, [pathname]);

  return null;
}
