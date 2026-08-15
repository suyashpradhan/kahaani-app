export const languages = ["en-IN", "hi-IN", "mr-IN"] as const;

export type LanguageCode = (typeof languages)[number];

export const languageMeta: Record<LanguageCode, { label: string; transcriptKey: "en" | "hi" | "mr"; storyClass: string }> = {
  "en-IN": { label: "English", transcriptKey: "en", storyClass: "story-latin" },
  "hi-IN": { label: "हिन्दी", transcriptKey: "hi", storyClass: "story-devanagari" },
  "mr-IN": { label: "मराठी", transcriptKey: "mr", storyClass: "story-devanagari" },
};

export const languageLabel = (code: LanguageCode) => languageMeta[code].label;

export const languageFromKey = (key: "en" | "hi" | "mr"): LanguageCode =>
  ({ en: "en-IN", hi: "hi-IN", mr: "mr-IN" } as const)[key];
