"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { removeHostRequestToken, savedHostRequestTokens } from "@/lib/hostRequests";
import { Icon } from "@/components/illustrations";
import { track } from "@/lib/analytics";

export function MemoryShelf() {
  const [tokens, setTokens] = useState<string[]>([]);
  useEffect(() => setTokens(savedHostRequestTokens()), []);
  const entries = useQuery(api.invitations.getHostShelf, {
    shareTokens: tokens,
  });
  const deleteHostMemory = useMutation(api.invitations.deleteHostMemory);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);

  const deleteMemory = async (shareToken: string, storytellerName: string) => {
    if (!window.confirm(`Delete ${storytellerName}'s memory? This permanently removes the recording and its written translations.`)) return;
    setDeletingToken(shareToken);
    try {
      const result = await deleteHostMemory({ shareToken });
      if (result.deleted) setTokens((current) => current.filter((token) => token !== shareToken));
      removeHostRequestToken(shareToken);
      if (result.deleted) track("memory_deleted");
    } finally {
      setDeletingToken(null);
    }
  };

  return (
    <main className="page">
      <div className="shell" style={{ maxWidth: 760 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 38,
          }}
        >
          <div className="wordmark">Kahaani</div>
          <Link
            href="/create"
            className="quiet-button"
            style={{ width: "auto", textDecoration: "none" }}
          >
            Ask a question
          </Link>
        </header>
        <div className="eyebrow">Your private shelf</div>
        <h1 className="memory-title" style={{ marginTop: 8 }}>
          Memories you&apos;re keeping.
        </h1>

        {entries === undefined && (
          <p style={{ color: "var(--muted)" }}>Opening your memories…</p>
        )}
        {entries?.length === 0 && (
          <section className="card" style={{ padding: 26 }}>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                margin: 0,
                color: "var(--ink2)",
              }}
            >
              Your first memory will appear here after you create a question.
            </p>
            <Link
              href="/create"
              className="primary"
              style={{ textDecoration: "none", marginTop: 18 }}
            >
              Create a question
            </Link>
          </section>
        )}
        <div style={{ display: "grid", gap: 12 }}>
          {entries?.map(({ shareToken, invitation, memory }) => {
            const ready = memory?.processingStatus === "ready";
            const processing = memory && !ready;
            return (
              <article
                className="card"
                key={shareToken}
                style={{
                  padding: 20,
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="eyebrow">
                    {invitation.storytellerName}{invitation.relationship ? ` · ${invitation.relationship}` : ""}
                  </div>
                  <div
                    className="story-latin"
                    style={{ fontSize: 22, lineHeight: 1.4, marginTop: 7 }}
                  >
                    {invitation.questionOriginal}
                  </div>
                  <p
                    style={{
                      margin: "9px 0 0",
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    {ready
                      ? "Memory ready"
                      : processing
                        ? "Keeping this memory…"
                        : "Waiting for her story…"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
                  {ready ? (
                    <Link
                      href={`/memory/${memory?.memoryToken}`}
                      className="play"
                      aria-label={`Open ${invitation.storytellerName}'s memory`}
                    >
                      <Icon name="play" size={28} />
                    </Link>
                  ) : (
                    <Link
                      href={`/create/${shareToken}`}
                      className="secondary"
                      style={{ width: "auto", minHeight: 48, padding: "0 15px", fontSize: 15, textDecoration: "none" }}
                    >
                      View
                    </Link>
                  )}
                  <button
                    className="quiet-button"
                    disabled={deletingToken === shareToken}
                    onClick={() => void deleteMemory(shareToken, invitation.storytellerName)}
                    style={{ width: "auto", minHeight: 48, padding: "0 15px", color: "var(--voice)" }}
                  >
                    {deletingToken === shareToken ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
