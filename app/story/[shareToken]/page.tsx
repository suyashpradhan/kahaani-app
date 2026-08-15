import type { Metadata } from "next";
import { StoryExperience } from "@/components/story/StoryExperience";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function StoryPage({ params }: { params: Promise<{ shareToken: string }> }) { const { shareToken } = await params; return <StoryExperience shareToken={shareToken}/>; }
