import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { language } from "./schema";
import { synthesize, translate } from "./sarvam";

const invitationInput = {
  hostName: v.string(),
  storytellerName: v.string(),
  relationship: v.string(),
  storytellerLanguage: language,
  questionOriginal: v.string(),
  // P0 host questions are authored in English. The single language choice is
  // always the storyteller's output language, so it can never suppress translation.
  questionSourceLanguage: v.literal("en-IN"),
};

function token() {
  const values = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(values, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export const createPrepared = internalMutation({
  args: { ...invitationInput, questionLocalized: v.string() },
  handler: async (ctx, args) =>
    ctx.db.insert("invitations", {
      ...args,
      shareToken: token(),
      promptAudioSource: "none",
      status: "created",
      createdAt: Date.now(),
    }),
});

export const prepare = action({
  args: invitationInput,
  handler: async (ctx, args): Promise<any> => {
    const questionLocalized = await translate(
      args.questionOriginal,
      args.questionSourceLanguage,
      args.storytellerLanguage,
    );
    return ctx.runMutation(internal.invitations.createPrepared, {
      ...args,
      questionLocalized,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});

export const attachHostPrompt = mutation({
  args: { invitationId: v.id("invitations"), storageId: v.id("_storage") },
  handler: async (ctx, { invitationId, storageId }) => {
    await ctx.db.patch(invitationId, {
      promptAudioStorageId: storageId,
      promptAudioSource: "host-recorded",
    });
  },
});

export const attachGeneratedPrompt = internalMutation({
  args: { invitationId: v.id("invitations"), storageId: v.id("_storage") },
  handler: async (ctx, { invitationId, storageId }) => {
    await ctx.db.patch(invitationId, {
      promptAudioStorageId: storageId,
      promptAudioSource: "sarvam-tts",
    });
  },
});

export const generatePrompt = action({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) => {
    const invitation = await ctx.runQuery(internal.invitations.getInternal, {
      invitationId,
    });
    if (!invitation) throw new Error("Invitation not found");
    const audio = await synthesize(
      invitation.questionLocalized,
      invitation.storytellerLanguage,
    );
    const storageId = await ctx.storage.store(
      new Blob([audio], { type: "audio/wav" }),
    );
    await ctx.runMutation(internal.invitations.attachGeneratedPrompt, {
      invitationId,
      storageId,
    });
  },
});

export const getInternal = internalQuery({
  args: { invitationId: v.id("invitations") },
  handler: (ctx, { invitationId }) => ctx.db.get(invitationId),
});

export const getStory = query({
  args: { shareToken: v.string() },
  handler: async (ctx, { shareToken }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
      .unique();
    if (!invitation) return null;
    return {
      ...invitation,
      promptAudioUrl: invitation.promptAudioStorageId
        ? await ctx.storage.getUrl(invitation.promptAudioStorageId)
        : null,
    };
  },
});

export const markOpened = mutation({
  args: { shareToken: v.string() },
  handler: async (ctx, { shareToken }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
      .unique();
    if (invitation && invitation.status === "created")
      await ctx.db.patch(invitation._id, { status: "opened" });
  },
});

export const shareTokenFor = query({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) =>
    (await ctx.db.get(invitationId))?.shareToken ?? null,
});

export const getHostShelf = query({
  args: { shareTokens: v.array(v.string()) },
  handler: async (ctx, { shareTokens }) => {
    const entries = await Promise.all(shareTokens.slice(0, 30).map(async (shareToken) => {
      const invitation = await ctx.db.query("invitations").withIndex("by_share_token", (q) => q.eq("shareToken", shareToken)).unique();
      if (!invitation) return null;
      const memory = await ctx.db.query("memories").withIndex("by_invitation", (q) => q.eq("invitationId", invitation._id)).order("desc").first();
      return { shareToken, invitation: { storytellerName: invitation.storytellerName, relationship: invitation.relationship, questionOriginal: invitation.questionOriginal, status: invitation.status, createdAt: invitation.createdAt }, memory: memory && { memoryToken: memory.memoryToken, processingStatus: memory.processingStatus } };
    }));
    return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  },
});

export const deleteHostMemory = mutation({
  args: { shareToken: v.string() },
  handler: async (ctx, { shareToken }) => {
    // The host browser owns this unguessable private token in local storage.
    // No document IDs are exposed in the UI or accepted from the client.
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
      .unique();
    if (!invitation) return { deleted: false };

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_invitation", (q) => q.eq("invitationId", invitation._id))
      .collect();

    for (const memory of memories) {
      await ctx.storage.delete(memory.audioStorageId);
      await ctx.db.delete(memory._id);
    }
    if (invitation.promptAudioStorageId) {
      await ctx.storage.delete(invitation.promptAudioStorageId);
    }
    await ctx.db.delete(invitation._id);
    return { deleted: true };
  },
});
