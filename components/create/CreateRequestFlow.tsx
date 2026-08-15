"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { languageLabel, languages, type LanguageCode } from "@/lib/languages";
import { supportedRecordingMimeType } from "@/lib/audio";
import { shareMessage } from "@/lib/share";
import { Icon } from "@/components/illustrations";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

const presets = [
  "What was the home you grew up in like?",
  "What did festivals feel like when you were young?",
  "Tell me about a meal from childhood you still remember.",
  "What is something about your parents you never want us to forget?",
];

async function uploadBlob(blob: Blob, uploadUrl: string): Promise<Id<"_storage">> {
  const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
  if (!result.ok) throw new Error("The recording could not be uploaded");
  return (await result.json()).storageId as Id<"_storage">;
}

export function CreateRequestFlow() {
  const [step, setStep] = useState(0);
  const [hostName, setHostName] = useState("Suyash");
  const [storytellerName, setStorytellerName] = useState("Ajji");
  const [relationship, setRelationship] = useState("Grandmother");
  const [storytellerLanguage, setStorytellerLanguage] = useState<LanguageCode>("hi-IN");
  const [question, setQuestion] = useState(presets[0]);
  const [questionSourceLanguage, setQuestionSourceLanguage] = useState<LanguageCode>("en-IN");
  const [chosenPreset, setChosenPreset] = useState(0);
  const [invitationId, setInvitationId] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const prepare = useAction(api.invitations.prepare);
  const uploadUrl = useMutation(api.invitations.generateUploadUrl);
  const attachHostPrompt = useMutation(api.invitations.attachHostPrompt);
  const generatePrompt = useAction(api.invitations.generatePrompt);
  const shareToken = useQuery(api.invitations.shareTokenFor, invitationId ? { invitationId } : "skip");
  const memory = useQuery(api.memories.getForInvitation, invitationId ? { invitationId } : "skip");

  const createInvitation = async () => {
    setBusy(true); setMessage(null);
    try {
      const id = await prepare({ hostName: hostName.trim(), storytellerName: storytellerName.trim(), relationship: relationship.trim(), storytellerLanguage, questionOriginal: question.trim(), questionSourceLanguage });
      setInvitationId(id); setStep(3);
    } catch { setMessage("We could not prepare the question just now. Please try once more."); }
    finally { setBusy(false); }
  };

  const useKahaaniVoice = async () => {
    if (!invitationId) return;
    setBusy(true); setMessage(null);
    try { await generatePrompt({ invitationId }); setStep(4); }
    catch { setMessage("Kahaani's voice is taking a little longer. You can try again, or record it in your voice."); }
    finally { setBusy(false); }
  };

  const recordHostPrompt = async () => {
    if (!invitationId || recording) return;
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = supportedRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop()); setRecording(false); setBusy(true);
        try { const storageId = await uploadBlob(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }), await uploadUrl()); await attachHostPrompt({ invitationId, storageId }); setStep(4); }
        catch { setMessage("Your question is still here. The recording could not be saved, so please try once more."); }
        finally { setBusy(false); }
      };
      recorder.start(); setRecording(true);
      window.setTimeout(() => recorder.state === "recording" && recorder.stop(), 45_000);
      (window as any).__kahaaniHostRecorder = recorder;
    } catch { setMessage("We could not reach your microphone. You can still use Kahaani's voice."); }
  };

  const stopHostPrompt = () => { const recorder = (window as any).__kahaaniHostRecorder as MediaRecorder | undefined; if (recorder?.state === "recording") recorder.stop(); };
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const privateLink = shareToken ? `${origin}/story/${shareToken}` : "";
  const share = async () => {
    if (!privateLink) return;
    if (navigator.share) { await navigator.share({ title: "A little question for you", text: shareMessage, url: privateLink }); }
    else { await navigator.clipboard.writeText(privateLink); setMessage("Private link copied."); }
  };

  return <main className="page"><div className="shell"><header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:34 }}><div className="wordmark">Kahaani</div><span className="eyebrow">a small question</span></header><div className="stepper" aria-label={`Step ${Math.min(step + 1, 4)} of 4`}>{[0,1,2,3].map((value)=><span className={value <= step ? "active" : ""} key={value}/>)}</div>
    {step === 0 && <section style={{ display:"flex", flexDirection:"column", gap:24 }}><div><div className="eyebrow">Step 1</div><h1 className="memory-title" style={{ marginTop:8 }}>Who would you like to hear from?</h1></div><label className="field">Their name<input value={storytellerName} onChange={(e)=>setStorytellerName(e.target.value)} placeholder="Ajji"/></label><label className="field">Your relationship<input value={relationship} onChange={(e)=>setRelationship(e.target.value)} placeholder="Grandmother"/></label><label className="field">Your name<input value={hostName} onChange={(e)=>setHostName(e.target.value)} placeholder="Suyash"/></label><button className="primary" disabled={!hostName.trim() || !storytellerName.trim() || !relationship.trim()} onClick={()=>setStep(1)}>Continue</button></section>}
    {step === 1 && <section style={{ display:"flex", flexDirection:"column", gap:24 }}><div><div className="eyebrow">Step 2</div><h1 className="memory-title" style={{ marginTop:8 }}>Which language feels most natural to them?</h1></div><div className="language-grid">{languages.map((code)=><button key={code} className={`choice ${storytellerLanguage===code ? "selected" : ""}`} onClick={()=>setStorytellerLanguage(code)}>{languageLabel(code)}</button>)}</div><button className="primary" onClick={()=>setStep(2)}>Continue</button><button className="quiet-button" onClick={()=>setStep(0)}>Back</button></section>}
    {step === 2 && <section style={{ display:"flex", flexDirection:"column", gap:20 }}><div><div className="eyebrow">Step 3</div><h1 className="memory-title" style={{ marginTop:8 }}>What would you like to ask?</h1></div><div style={{ display:"flex", flexDirection:"column", gap:10 }}>{presets.map((preset,index)=><button key={preset} className={`preset ${chosenPreset===index ? "selected" : ""}`} onClick={()=>{setChosenPreset(index);setQuestion(preset);setQuestionSourceLanguage("en-IN");}}>{preset}</button>)}</div><label className="field">Or write your own question<textarea value={question} onChange={(e)=>{setQuestion(e.target.value);setChosenPreset(-1);}}/></label><label className="field">Written in<select value={questionSourceLanguage} onChange={(e)=>setQuestionSourceLanguage(e.target.value as LanguageCode)} style={{ minHeight:52, border:"1.5px solid #DCCDB8", borderRadius:16, background:"var(--surface)", padding:"0 16px" }}>{languages.map(code=><option key={code} value={code}>{languageLabel(code)}</option>)}</select></label><button className="primary" disabled={busy || !question.trim()} onClick={createInvitation}>{busy ? "Preparing your question…" : "Prepare this question"}</button><button className="quiet-button" onClick={()=>setStep(1)}>Back</button></section>}
    {step === 3 && <section style={{ display:"flex", flexDirection:"column", gap:22 }}><div><div className="eyebrow">One more thing</div><h1 className="memory-title" style={{ marginTop:8 }}>How should {storytellerName} hear this question?</h1></div><div className="card" style={{ padding:20 }}><div className="eyebrow" style={{ color:"var(--voice)" }}>The question</div><p className="story-latin" style={{ fontSize:24, lineHeight:1.45, margin:"10px 0 0" }}>{question}</p></div>{recording ? <button className="primary story-primary" onClick={stopHostPrompt}><Icon name="stop" size={30}/>Finish recording</button> : <button className="primary" disabled={busy} onClick={recordHostPrompt}><Icon name="mic"/>Record this question in my voice</button>}<button className="secondary" disabled={busy || recording} onClick={useKahaaniVoice}><Icon name="sound"/>Use Kahaani&apos;s voice</button></section>}
    {step === 4 && <section className="share-card card"><div className="eyebrow" style={{ color:"var(--success)" }}>Ready to share</div><h2>This question is ready.</h2><p>{storytellerName} can simply open this private link, listen or read, and tell their story.</p><div className="share-actions"><button className="primary" onClick={share}><Icon name="share"/>Share</button><button className="secondary" onClick={async()=>{await navigator.clipboard.writeText(privateLink);setMessage("Private link copied.");}}><Icon name="copy"/>Copy private link</button></div>{privateLink && <p style={{ fontSize:13, overflowWrap:"anywhere", marginTop:18 }}>{privateLink}</p>}{memory && <div className="processing-note">{memory.processingStatus === "ready" ? <Link href={`/memory/${memory.memoryToken}`} style={{ color:"var(--voice)",fontWeight:600 }}>This memory is ready to open.</Link> : "Keeping this memory… The original recording is already safe."}</div>}</section>}
    {message && <p role="status" style={{ color:"var(--ink2)", lineHeight:1.5, marginTop:16 }}>{message}</p>}
  </div></main>;
}
