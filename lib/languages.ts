export const languages = ["en-IN", "hi-IN"] as const;

export type LanguageCode = (typeof languages)[number];

export const languageMeta: Record<LanguageCode, { label: string; transcriptKey: "en" | "hi"; storyClass: string }> = {
  "en-IN": { label: "English", transcriptKey: "en", storyClass: "story-latin" },
  "hi-IN": { label: "हिन्दी", transcriptKey: "hi", storyClass: "story-devanagari" },
};

export const languageLabel = (code: LanguageCode) => languageMeta[code].label;

export const languageFromKey = (key: "en" | "hi"): LanguageCode =>
  ({ en: "en-IN", hi: "hi-IN" } as const)[key];
