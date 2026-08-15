import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const language = v.union(
  v.literal("en-IN"),
  v.literal("hi-IN"),
);

const invitationStatus = v.union(
  v.literal("created"), v.literal("opened"), v.literal("recording"),
  v.literal("answered"), v.literal("processing"), v.literal("ready"), v.literal("failed"),
);

const processingStatus = v.union(
  v.literal("audio-saved"), v.literal("transcribing"), v.literal("translating"),
  v.literal("ready"), v.literal("failed"),
);

export default defineSchema({
  invitations: defineTable({
    shareToken: v.string(), hostName: v.string(), storytellerName: v.string(), relationship: v.string(),
    storytellerLanguage: language, questionOriginal: v.string(), questionSourceLanguage: language,
    questionLocalized: v.string(), promptAudioStorageId: v.optional(v.id("_storage")),
    promptAudioSource: v.union(v.literal("host-recorded"), v.literal("sarvam-tts"), v.literal("none")),
    status: invitationStatus, createdAt: v.number(),
  }).index("by_share_token", ["shareToken"]),
  memories: defineTable({
    memoryToken: v.string(), invitationId: v.id("invitations"), audioStorageId: v.id("_storage"),
    durationSec: v.number(), originalLanguage: language, originalTranscript: v.optional(v.string()),
    translations: v.optional(v.object({ en: v.optional(v.string()), hi: v.optional(v.string()) })),
    processingStatus,
    processingError: v.optional(v.union(v.literal("storage"), v.literal("transcription"), v.literal("translation"), v.literal("unknown"))),
    createdAt: v.number(),
  }).index("by_memory_token", ["memoryToken"]).index("by_invitation", ["invitationId"]),
});
