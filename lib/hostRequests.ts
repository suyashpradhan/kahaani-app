const storageKey = "kahaani-host-request-tokens";

export function savedHostRequestTokens() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((token): token is string => typeof token === "string").slice(0, 30) : [];
  } catch { return []; }
}

export function saveHostRequestToken(token: string) {
  const saved = savedHostRequestTokens();
  window.localStorage.setItem(storageKey, JSON.stringify([token, ...saved.filter((item) => item !== token)].slice(0, 30)));
}
