"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { clearPendingAudio, keepPendingAudio } from "@/lib/pendingAudio";
import { durationLabel, supportedRecordingMimeType } from "@/lib/audio";
import { Icon, PromptCue, SettleIllustration } from "@/components/illustrations";
import { languageMeta, type LanguageCode } from "@/lib/languages";

type Screen = "invite" | "recording" | "short-confirm" | "uploading" | "success" | "mic-error" | "upload-error";

const copy: Record<LanguageCode, { asked: (host: string) => string; hostRecording: (host: string) => string; generatedPrompt: string; tap: string; time: string; listening: string; finish: string; short: string; shortBody: string; keep: string; done: string; sendingTitle: string; sendingBody: string; safe: string; reached: (host: string) => string; close: string; micError: string; micBody: string; uploadError: string; uploadBody: string; retry: string }> = {
  "en-IN": { asked:(host)=>`${host} asked you something`, hostRecording:(host)=>`Hear ${host} ask`, generatedPrompt:"Hear the question", tap:"Tap to tell your story", time:"Take your time. There is no hurry.", listening:"We are listening.", finish:"I'm finished", short:"Finished already?", shortBody:"You spoke for only a few seconds. There is no hurry.", keep:"Keep going", done:"I'm done", sendingTitle:"Your story is on its way.", sendingBody:"We’re making sure the recording reaches your family safely.", safe:"Your story is safe.", reached:(host)=>`It has reached ${host}.`, close:"You can close this page now.", micError:"We couldn’t hear the microphone.", micBody:"Nothing was lost. If this link opened inside another app, try opening it in Chrome.", uploadError:"Your story is safe on this phone.", uploadBody:"Something is slow on our side. We’ll keep the recording here while you try again.", retry:"Try again" },
  "hi-IN": { asked:(host)=>`${host} ने आपसे कुछ पूछा है`, hostRecording:(host)=>`${host} की आवाज़ में सुनें`, generatedPrompt:"सवाल सुनें", tap:"अपनी कहानी सुनाने के लिए टैप करें", time:"आराम से बताइए। कोई जल्दी नहीं।", listening:"हम सुन रहे हैं।", finish:"कहानी पूरी हुई", short:"इतनी जल्दी?", shortBody:"आपने बस कुछ सेकंड बताया है। कोई जल्दी नहीं।", keep:"बोलते रहें", done:"मैंने पूरा कर लिया", sendingTitle:"आपकी कहानी भेजी जा रही है।", sendingBody:"हम पक्का कर रहे हैं कि यह रिकॉर्डिंग आपके परिवार तक सुरक्षित पहुँचे।", safe:"आपकी कहानी सुरक्षित है।", reached:(host)=>`यह ${host} तक पहुँच गई है।`, close:"अब आप यह पेज बंद कर सकती हैं।", micError:"हम माइक्रोफ़ोन तक नहीं पहुँच पाए।", micBody:"कुछ भी खोया नहीं है। अगर यह लिंक किसी दूसरे ऐप में खुला है, तो इसे Chrome में खोलें।", uploadError:"आपकी कहानी इस फ़ोन में सुरक्षित है।", uploadBody:"हमारी तरफ़ से थोड़ी देर हो रही है। दोबारा कोशिश करने तक रिकॉर्डिंग यहीं रहेगी।", retry:"फिर कोशिश करें" },
};

export function StoryExperience({ shareToken }: { shareToken: string }) {
  const invitation = useQuery(api.invitations.getStory, { shareToken });
  const markOpened = useMutation(api.invitations.markOpened);
  const getUploadUrl = useMutation(api.invitations.generateUploadUrl);
  const saveAnswer = useMutation(api.memories.saveAnswer);
  const [screen, setScreen] = useState<Screen>("invite");
  const [elapsed, setElapsed] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAt = useRef(0);
  const interval = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const confirmedShort = useRef(false);

  useEffect(() => { if (invitation) void markOpened({ shareToken }); }, [invitation, markOpened, shareToken]);
  useEffect(() => () => { if (interval.current) window.clearInterval(interval.current); streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  const startTimer = () => { startedAt.current = Date.now() - elapsed * 1000; interval.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250); };
  const stopTimer = () => { if (interval.current) window.clearInterval(interval.current); interval.current = null; };

  const upload = async (blob: Blob) => {
    if (!invitation) return;
    setScreen("uploading");
    try {
      const url = await getUploadUrl();
      const result = await fetch(url, { method:"POST", headers:{ "Content-Type": blob.type || "audio/webm" }, body:blob });
      if (!result.ok) throw new Error("upload failed");
      const { storageId } = await result.json();
      await saveAnswer({ invitationId: invitation._id, storageId, durationSec: Math.max(1, elapsed) });
      await clearPendingAudio(shareToken); setScreen("success");
    } catch { await keepPendingAudio(shareToken, blob).catch(()=>undefined); setScreen("upload-error"); }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setScreen("mic-error"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = supportedRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => { stream.getTracks().forEach((track)=>track.stop()); streamRef.current=null; const blob = new Blob(chunks,{type:recorder.mimeType || "audio/webm"}); setRecordingBlob(blob); void upload(blob); };
      recorder.start(1000); recorderRef.current=recorder; streamRef.current=stream; setElapsed(0); confirmedShort.current=false; setScreen("recording"); startedAt.current=Date.now(); startTimer();
    } catch { setScreen("mic-error"); }
  };

  const finish = () => {
    const recorder = recorderRef.current; if (!recorder) return;
    const seconds = Math.floor((Date.now()-startedAt.current)/1000); setElapsed(seconds);
    if (seconds < 10 && !confirmedShort.current && recorder.state === "recording") { confirmedShort.current=true; recorder.pause(); stopTimer(); setScreen("short-confirm"); return; }
    stopTimer(); if (recorder.state !== "inactive") recorder.stop();
  };
  const keepGoing = () => { recorderRef.current?.resume(); setScreen("recording"); startTimer(); };
  const retryUpload = () => recordingBlob && void upload(recordingBlob);

  if (invitation === undefined) return <main className="story-shell"><div className="story-head"><div className="wordmark">Kahaani</div></div><div className="story-main"><p style={{color:"var(--muted)"}}>Opening your question…</p></div></main>;
  if (!invitation) return <main className="story-shell"><div className="story-head"><div className="wordmark">Kahaani</div></div><div className="error-screen"><div className="error-disc"><Icon name="micOff" size={48}/></div><h1>This little page isn&apos;t here.</h1><p>Please ask your family member to send the private link again.</p></div></main>;
  const language = invitation.storytellerLanguage as LanguageCode;
  const text = copy[language];
  const storyClass = languageMeta[language].storyClass;

  return <main className="story-shell"><header className="story-head"><div className="wordmark">Kahaani</div><span className="eyebrow">{text.time}</span></header>
    {screen === "invite" && <div className="story-main"><div className="story-host"><div className="avatar"/><span>{text.asked(invitation.hostName)}</span></div><PromptCue/><div className={`prompt-question ${storyClass}`}>{invitation.questionLocalized}</div>{invitation.promptAudioUrl && <><audio ref={audioRef} src={invitation.promptAudioUrl}/><button className="hear-button" onClick={()=>void audioRef.current?.play()}><Icon name="sound" size={22}/>{invitation.promptAudioSource === "host-recorded" ? text.hostRecording(invitation.hostName) : text.generatedPrompt}</button></>}<div style={{marginTop:"auto"}}><button className="primary story-primary" onClick={startRecording}><Icon name="mic" size={36}/>{text.tap}</button><div className="story-note">{text.time}</div></div></div>}
    {screen === "recording" && <><div className={`recording-question ${storyClass}`}>{invitation.questionLocalized}</div><div className="recording-area"><div className="mic-orbit"><div className="mic-disc"><Icon name="mic" size={46}/></div></div><div className={`listening ${storyClass}`}>{text.listening}</div><div className="wave" aria-label="Recording visual">{Array.from({length:28},(_,index)=><span key={index} style={{height:`${16+(index*17)%68}px`}}/>)}</div><div className="timer">{durationLabel(elapsed)}</div></div><button className="primary finish" onClick={finish}><Icon name="stop" size={36}/>{text.finish}</button></>}
    {screen === "short-confirm" && <div className="success-screen"><div className="mic-disc" style={{width:108,height:108,background:"var(--voice-wash)",color:"var(--voice)",boxShadow:"none"}}><Icon name="stop" size={46}/></div><h1>{text.short}</h1><p>{text.shortBody}</p><div className="timer" style={{fontSize:26,color:"var(--muted)"}}>{durationLabel(elapsed)}</div><div style={{width:"100%"}}><button className="primary story-primary" onClick={keepGoing}><Icon name="mic" size={32}/>{text.keep}</button><button className="secondary" style={{marginTop:12,minHeight:72,fontSize:21}} onClick={finish}><Icon name="check" size={28}/>{text.done}</button></div></div>}
    {screen === "uploading" && <div className="success-screen"><SettleIllustration/><h1>{text.sendingTitle}</h1><p>{text.sendingBody}</p></div>}
    {screen === "success" && <div className="success-screen"><SettleIllustration/><h1>{text.safe}</h1><p>{text.reached(invitation.hostName)}</p><p style={{fontSize:18,color:"var(--muted)"}}>{text.close}</p></div>}
    {screen === "mic-error" && <div className="error-screen"><div className="error-disc"><Icon name="micOff" size={52}/></div><h1>{text.micError}</h1><p>{text.micBody}</p><button className="primary story-primary" onClick={startRecording}><Icon name="refresh" size={32}/>{text.retry}</button></div>}
    {screen === "upload-error" && <div className="error-screen"><div className="error-disc"><Icon name="micOff" size={52}/></div><h1>{text.uploadError}</h1><p>{text.uploadBody}</p><button className="primary story-primary" onClick={retryUpload}><Icon name="refresh" size={32}/>{text.retry}</button></div>}
  </main>;
}
