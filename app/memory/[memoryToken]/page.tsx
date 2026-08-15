import type { Metadata } from "next";
import { MemoryExperience } from "@/components/memory/MemoryExperience";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function MemoryPage({ params }: { params: Promise<{ memoryToken: string }> }) { const { memoryToken } = await params; return <MemoryExperience memoryToken={memoryToken}/>; }
