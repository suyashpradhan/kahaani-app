import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { transcribe, translate } from "./sarvam";

const targets = [
  ["en-IN", "en"], ["hi-IN", "hi"],
] as const;

export const processMemory = internalAction({
  args: { memoryId: v.id("memories") },
  handler: async (ctx, { memoryId }) => {
    try {
      await ctx.runMutation(internal.memories.setProcessing, { memoryId, status: "transcribing" });
      const memory = await ctx.runQuery(internal.memories.getInternal, { memoryId });
      if (!memory) throw new Error("Missing memory");
      const audioUrl = await ctx.storage.getUrl(memory.audioStorageId);
      if (!audioUrl) throw new Error("Missing audio");
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("Audio storage unavailable");
      const transcript = await transcribe(await response.blob(), memory.originalLanguage);
      await ctx.runMutation(internal.memories.saveTranscript, { memoryId, transcript });

      const results = await Promise.allSettled(targets.filter(([code]) => code !== memory.originalLanguage).map(async ([code, key]) => {
        const text = await translate(transcript, memory.originalLanguage, code);
        await ctx.runMutation(internal.memories.saveTranslation, { memoryId, key, text });
      }));
      const translationFailed = results.some((result) => result.status === "rejected");
      await ctx.runMutation(internal.memories.setProcessing, { memoryId, status: "ready", ...(translationFailed ? { error: "translation" as const } : {}) });
    } catch (error) {
      console.error("Kahaani processing failed", error);
      await ctx.runMutation(internal.memories.setProcessing, { memoryId, status: "failed", error: "transcription" });
    }
  },
});
