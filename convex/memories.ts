import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { language } from "./schema";

function token() {
  const values = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(values, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const saveAnswer = mutation({
  args: { invitationId: v.id("invitations"), storageId: v.id("_storage"), durationSec: v.number() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");
    const memoryId = await ctx.db.insert("memories", {
      memoryToken: token(), invitationId: args.invitationId, audioStorageId: args.storageId,
      durationSec: args.durationSec, originalLanguage: invitation.storytellerLanguage,
      processingStatus: "audio-saved", createdAt: Date.now(),
    });
    await ctx.db.patch(args.invitationId, { status: "processing" });
    await ctx.scheduler.runAfter(0, internal.processing.processMemory, { memoryId });
    return memoryId;
  },
});

export const setProcessing = internalMutation({
  args: { memoryId: v.id("memories"), status: v.union(v.literal("transcribing"), v.literal("translating"), v.literal("ready"), v.literal("failed")), error: v.optional(v.union(v.literal("storage"), v.literal("transcription"), v.literal("translation"), v.literal("unknown"))) },
  handler: async (ctx, { memoryId, status, error }) => {
    await ctx.db.patch(memoryId, { processingStatus: status, processingError: error });
    const memory = await ctx.db.get(memoryId);
    if (memory && status === "ready") await ctx.db.patch(memory.invitationId, { status: "ready" });
    if (memory && status === "failed") await ctx.db.patch(memory.invitationId, { status: "failed" });
  },
});

export const saveTranscript = internalMutation({
  args: { memoryId: v.id("memories"), transcript: v.string() },
  handler: (ctx, { memoryId, transcript }) => ctx.db.patch(memoryId, { originalTranscript: transcript, processingStatus: "translating" }),
});

export const saveTranslation = internalMutation({
  args: { memoryId: v.id("memories"), key: v.union(v.literal("en"), v.literal("hi")), text: v.string() },
  handler: async (ctx, { memoryId, key, text }) => {
    const memory = await ctx.db.get(memoryId);
    if (!memory) return;
    await ctx.db.patch(memoryId, { translations: { ...memory.translations, [key]: text } });
  },
});

export const getInternal = internalQuery({ args: { memoryId: v.id("memories") }, handler: (ctx, { memoryId }) => ctx.db.get(memoryId) });

export const getMemory = query({
  args: { memoryToken: v.string() },
  handler: async (ctx, { memoryToken }) => {
    const memory = await ctx.db.query("memories").withIndex("by_memory_token", (q) => q.eq("memoryToken", memoryToken)).unique();
    if (!memory) return null;
    const invitation = await ctx.db.get(memory.invitationId);
    return { ...memory, audioUrl: await ctx.storage.getUrl(memory.audioStorageId), invitation: invitation && { hostName: invitation.hostName, storytellerName: invitation.storytellerName, relationship: invitation.relationship, questionLocalized: invitation.questionLocalized } };
  },
});

export const getForInvitation = query({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) => {
    const memory = await ctx.db.query("memories").withIndex("by_invitation", (q) => q.eq("invitationId", invitationId)).order("desc").first();
    return memory ? { memoryToken: memory.memoryToken, processingStatus: memory.processingStatus } : null;
  },
});
