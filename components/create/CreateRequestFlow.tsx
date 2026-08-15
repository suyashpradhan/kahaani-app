"use client";

import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { languageLabel, languages, type LanguageCode } from "@/lib/languages";
import { supportedRecordingMimeType } from "@/lib/audio";
import { saveHostRequestToken } from "@/lib/hostRequests";
import { shareMessage } from "@/lib/share";
import { Icon } from "@/components/illustrations";

const presets = [
  "What was the home you grew up in like?",
  "What did festivals feel like when you were young?",
  "Tell me about a meal from childhood you still remember.",
  "What is something about your parents you never want us to forget?",
];

async function uploadBlob(
  blob: Blob,
  uploadUrl: string,
): Promise<Id<"_storage">> {
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob,
  });
  if (!result.ok) throw new Error("The recording could not be uploaded");
  return (await result.json()).storageId as Id<"_storage">;
}

export function CreateRequestFlow() {
  const [hostName, setHostName] = useState("");
  const [storytellerName, setStorytellerName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [storytellerLanguage, setStorytellerLanguage] =
    useState<LanguageCode>("en-IN");
  const [question, setQuestion] = useState(presets[0]);
  const [chosenPreset, setChosenPreset] = useState(0);
  const [questionMode, setQuestionMode] = useState<"typed" | "voice">("typed");
  const [invitationId, setInvitationId] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceQuestion, setVoiceQuestion] = useState<Blob | null>(null);
  const [voiceStorageId, setVoiceStorageId] = useState<Id<"_storage"> | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);

  const prepare = useAction(api.invitations.prepare);
  const prepareVoice = useAction(api.invitations.prepareVoice);
  const generatePrompt = useAction(api.invitations.generatePrompt);
  const uploadUrl = useMutation(api.invitations.generateUploadUrl);
  const shareToken = useQuery(
    api.invitations.shareTokenFor,
    invitationId ? { invitationId } : "skip",
  );
  const memory = useQuery(
    api.memories.getForInvitation,
    invitationId ? { invitationId } : "skip",
  );

  useEffect(() => {
    if (shareToken) saveHostRequestToken(shareToken);
  }, [shareToken]);
  useEffect(
    () => () =>
      voiceStreamRef.current?.getTracks().forEach((track) => track.stop()),
    [],
  );

  const createFast = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const id = await prepare({
        hostName: hostName.trim(),
        storytellerName: storytellerName.trim(),
        relationship: relationship.trim(),
        storytellerLanguage,
        questionOriginal: question.trim(),
        questionSourceLanguage: "en-IN",
      });
      setInvitationId(id);
      await generatePrompt({ invitationId: id });
    } catch {
      setMessage(
        "We could not prepare this question just now. Please try once more.",
      );
    } finally {
      setBusy(false);
    }
  };

  const createVoiceQuestion = async () => {
    if (!voiceQuestion) return;
    setBusy(true);
    setMessage(null);
    try {
      const storageId =
        voiceStorageId ?? (await uploadBlob(voiceQuestion, await uploadUrl()));
      setVoiceStorageId(storageId);
      const id = await prepareVoice({
        hostName: hostName.trim(),
        storytellerName: storytellerName.trim(),
        relationship: relationship.trim(),
        storytellerLanguage,
        promptAudioStorageId: storageId,
      });
      setInvitationId(id);
    } catch {
      setMessage(
        "We could not turn this recording into a written question yet. Your recording is still here—please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const recordVoiceQuestion = async () => {
    if (recording) return;
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = supportedRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) =>
        event.data.size && chunks.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        voiceStreamRef.current = null;
        setRecording(false);
        setVoiceQuestion(
          new Blob(chunks, { type: recorder.mimeType || "audio/webm" }),
        );
        setVoiceStorageId(null);
        setMessage(
          "Your question is recorded. Create the private link when you are ready.",
        );
      };
      recorder.start();
      setRecording(true);
      voiceRecorderRef.current = recorder;
      voiceStreamRef.current = stream;
    } catch {
      setMessage(
        "We could not reach your microphone. Please allow microphone access and try again.",
      );
    }
  };

  const stopVoiceQuestion = () => {
    if (voiceRecorderRef.current?.state === "recording")
      voiceRecorderRef.current.stop();
  };
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const privateLink = shareToken ? `${origin}/story/${shareToken}` : "";
  const share = async () => {
    if (!privateLink) return;
    if (navigator.share)
      await navigator.share({
        title: "A little question for you",
        text: shareMessage,
        url: privateLink,
      });
    else {
      await navigator.clipboard.writeText(privateLink);
      setMessage("Private link copied.");
    }
  };
  const valid = Boolean(
    hostName.trim() &&
    storytellerName.trim() &&
    (questionMode === "typed" ? question.trim() : voiceQuestion),
  );

  if (invitationId)
    return (
      <main className="page">
        <div className="shell" style={{ maxWidth: 640 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 36,
            }}
          >
            <div className="wordmark">Kahaani</div>
            <Link
              href="/memories"
              className="quiet-button"
              style={{ width: "auto", textDecoration: "none" }}
            >
              View memories
            </Link>
          </header>
          <section className="share-card card">
            <div className="eyebrow" style={{ color: "var(--success)" }}>
              Ready to share
            </div>
            <h2>This question is ready.</h2>
            <p>
              {storytellerName} can simply open this private link, hear the{" "}
              {languageLabel(storytellerLanguage)} question, and tell their
              story.
            </p>
            <div className="share-actions">
              <button className="primary" onClick={share}>
                <Icon name="share" />
                Share
              </button>
              <button
                className="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(privateLink);
                  setMessage("Private link copied.");
                }}
              >
                <Icon name="copy" />
                Copy private link
              </button>
            </div>
            {privateLink && (
              <>
                <p
                  style={{
                    fontSize: 13,
                    overflowWrap: "anywhere",
                    marginTop: 18,
                  }}
                >
                  {privateLink}
                </p>
                <Link
                  className="quiet-button"
                  href={`/create/${shareToken}`}
                  style={{ marginTop: 8, textDecoration: "none" }}
                >
                  See when this memory arrives
                </Link>
              </>
            )}
            {memory && (
              <div className="processing-note">
                {memory.processingStatus === "ready" ? (
                  <Link
                    href={`/memory/${memory.memoryToken}`}
                    style={{ color: "var(--voice)", fontWeight: 600 }}
                  >
                    This memory is ready to open.
                  </Link>
                ) : (
                  "Keeping this memory… The original recording is already safe."
                )}
              </div>
            )}
          </section>
          {message && (
            <p
              role="status"
              style={{ color: "var(--ink2)", lineHeight: 1.5, marginTop: 16 }}
            >
              {message}
            </p>
          )}
        </div>
      </main>
    );

  return (
    <main className="page">
      <div className="shell" style={{ maxWidth: 760 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 34,
          }}
        >
          <div className="wordmark">Kahaani</div>
          <Link
            href="/memories"
            className="quiet-button"
            style={{ width: "auto", textDecoration: "none" }}
          >
            View memories
          </Link>
        </header>
        <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div className="eyebrow">A small question</div>
            <h1 className="memory-title" style={{ marginTop: 8 }}>
              Make a private page for someone you love.
            </h1>
            <p
              style={{
                color: "var(--ink2)",
                fontSize: 17,
                lineHeight: 1.55,
                margin: "12px 0 0",
              }}
            >
              They will see one question and one recording button. Nothing else.
            </p>
          </div>
          <div>
            <div className="eyebrow">Who is this for?</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <label className="field">
                Their name
                <input
                  required
                  value={storytellerName}
                  onChange={(event) => setStorytellerName(event.target.value)}
                  placeholder="Nani, Maa, Chachi"
                />
              </label>
              {/* <label className="field">
                Relationship{" "}
                <input
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  placeholder="Grandmother, Mother, Aunt"
                />
              </label> */}
              <label className="field">
                Your name
                <input
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                  placeholder="Suyash"
                />
              </label>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Their language
            </div>
            <div className="language-grid">
              {languages.map((code) => (
                <button
                  key={code}
                  className={`choice ${storytellerLanguage === code ? "selected" : ""}`}
                  onClick={() => setStorytellerLanguage(code)}
                >
                  {languageLabel(code)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              How would you like to ask?
            </div>
            <div className="language-grid" style={{ marginBottom: 16 }}>
              <button
                className={`choice ${questionMode === "typed" ? "selected" : ""}`}
                onClick={() => setQuestionMode("typed")}
              >
                Choose a question
              </button>
              <button
                className={`choice ${questionMode === "voice" ? "selected" : ""}`}
                onClick={() => setQuestionMode("voice")}
              >
                <Icon name="mic" size={21} />
                Ask in my own voice
              </button>
            </div>
            {questionMode === "typed" ? (
              <>
                <div className="eyebrow" style={{ marginBottom: 10 }}>
                  Your question
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {presets.map((preset, index) => (
                    <button
                      key={preset}
                      className={`preset ${chosenPreset === index ? "selected" : ""}`}
                      onClick={() => {
                        setChosenPreset(index);
                        setQuestion(preset);
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <label className="field" style={{ marginTop: 12 }}>
                  Or write your own question
                  <textarea
                    value={question}
                    onChange={(event) => {
                      setQuestion(event.target.value);
                      setChosenPreset(-1);
                    }}
                  />
                </label>
              </>
            ) : (
              <div
                className="card"
                style={{ padding: 20, display: "grid", gap: 14 }}
              >
                <div>
                  <div className="eyebrow">
                    Your voice, in {languageLabel(storytellerLanguage)}
                  </div>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--ink2)",
                      lineHeight: 1.5,
                    }}
                  >
                    Say the question exactly as you would like{" "}
                    {storytellerName.trim() || "them"} to hear it. Kahaani will
                    preserve your voice and use the transcription as the visible
                    question.
                  </p>
                </div>
                {recording ? (
                  <button className="secondary" onClick={stopVoiceQuestion}>
                    <Icon name="stop" />
                    Finish recording your question
                  </button>
                ) : (
                  <button className="primary" onClick={recordVoiceQuestion}>
                    <Icon name="mic" />
                    {voiceQuestion ? "Record again" : "Record your question"}
                  </button>
                )}
                {voiceQuestion && (
                  <div className="processing-note">
                    Your question is recorded. It will be spoken in your own
                    voice.
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="primary"
            disabled={!valid || busy}
            onClick={
              questionMode === "typed" ? createFast : createVoiceQuestion
            }
          >
            <Icon name="sound" />
            {busy
              ? questionMode === "voice"
                ? "Preparing your recorded question…"
                : "Preparing your question…"
              : "Create and share"}
          </button>
          <p
            style={{
              margin: 0,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            {questionMode === "voice"
              ? "For a voice question, speak in the language you selected above."
              : "The host experience stays in English. Kahaani translates and speaks the question in their chosen language."}
          </p>
          {message && (
            <p
              role="status"
              style={{ color: "var(--ink2)", lineHeight: 1.5, margin: 0 }}
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
