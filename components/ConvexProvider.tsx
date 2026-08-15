"use client";

import { ConvexProvider as Provider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"), []);
  return <Provider client={client}>{children}</Provider>;
}
