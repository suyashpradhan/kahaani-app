"use client";

import posthog from "posthog-js";

type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

let initialized = false;

export function initializeAnalytics() {
  const projectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (initialized || !projectKey || typeof window === "undefined") return;

  posthog.init(projectKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "never",
    property_denylist: ["$current_url", "$referrer", "$referring_domain", "$pathname"],
  });
  initialized = true;
}

// Keep analytics metadata product-level and anonymous. Never pass names,
// questions, bearer tokens, transcripts, audio URLs, or recording content here.
export function track(event: string, properties: AnalyticsProperties = {}) {
  initializeAnalytics();
  if (!initialized) return;
  posthog.capture(event, properties);
}
