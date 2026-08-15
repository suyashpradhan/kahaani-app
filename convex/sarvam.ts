import type { LanguageCode } from "../lib/languages";

const baseUrl = "https://api.sarvam.ai";

function headers() {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("Sarvam is not configured");
  return { "api-subscription-key": apiKey };
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");
  throw new Error(`Sarvam request failed (${response.status}): ${text.slice(0, 160)}`);
}

export async function translate(input: string, source: LanguageCode, target: LanguageCode) {
  if (source === target) return input;
  const response = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ input, source_language_code: source, target_language_code: target, model: "sarvam-translate:v1", mode: "formal" }),
  });
  if (!response.ok) await readError(response);
  const body = await response.json();
  return body.translated_text as string;
}

export async function synthesize(text: string, targetLanguage: LanguageCode) {
  const response = await fetch(`${baseUrl}/text-to-speech`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_language_code: targetLanguage, model: "bulbul:v3", speaker: "shubh", output_audio_codec: "wav", pace: 0.9 }),
  });
  if (!response.ok) await readError(response);
  const body = await response.json();
  const encoded = body.audios?.[0] as string | undefined;
  if (!encoded) throw new Error("Sarvam did not return prompt audio");
  return Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
}

export async function transcribe(audio: Blob, language: LanguageCode) {
  const formData = new FormData();
  formData.append("file", audio, "kahaani-story.webm");
  formData.append("model", "saaras:v3");
  formData.append("mode", "transcribe");
  formData.append("language_code", language);
  const response = await fetch(`${baseUrl}/speech-to-text`, { method: "POST", headers: headers(), body: formData });
  if (!response.ok) await readError(response);
  const body = await response.json();
  if (!body.transcript) throw new Error("Sarvam did not return a transcript");
  return body.transcript as string;
}
