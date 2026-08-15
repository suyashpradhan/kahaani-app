import type { Metadata } from "next";
import { MemoryStatus } from "@/components/create/MemoryStatus";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RequestStatusPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  return <MemoryStatus shareToken={shareToken} />;
}
