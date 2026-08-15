"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { languageLabel, languageMeta, type LanguageCode } from "@/lib/languages";
import { durationLabel } from "@/lib/audio";
import { Icon } from "@/components/illustrations";
import { track } from "@/lib/analytics";

const peaks = [15,25,20,33,28,40,22,31,18,36,24,30,16,26,21,34,18,29,38,20,32,25,16,27,35,19,29,23,36,17,31,26,20,34,24,18,28,35,22,30,17,26,33,20];

export function MemoryExperience({ memoryToken }: { memoryToken: string }) {
  const memory = useQuery(api.memories.getMemory, { memoryToken });
  const [selected, setSelected] = useState<LanguageCode | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const viewedTracked = useRef(false);
  const audioPlayedTracked = useRef(false);
  useEffect(() => {
    if (!memory || viewedTracked.current) return;
    viewedTracked.current = true;
    track("memory_viewed", { original_language: memory.originalLanguage, processing_status: memory.processingStatus });
  }, [memory]);
  if (memory === undefined) return <main className="memory-shell"><header className="memory-head"><div className="wordmark">Kahaani</div></header><p style={{color:"var(--muted)"}}>Opening this memory…</p></main>;
  if (!memory || !memory.invitation) return <main className="memory-shell"><header className="memory-head"><div className="wordmark">Kahaani</div></header><div className="unavailable">This private memory could not be found.</div></main>;
  const original = memory.originalLanguage as LanguageCode;
  const active = selected ?? original;
  const key = languageMeta[active].transcriptKey;
  const transcript = active === original ? memory.originalTranscript : memory.translations?.[key];
  const date = new Intl.DateTimeFormat("en-IN", { day:"numeric", month:"long", year:"numeric" }).format(new Date(memory.createdAt));
  const paragraphs: string[] = transcript ? transcript.split(/\n{2,}/) : [];
  return <main className="memory-shell"><header className="memory-head"><div className="wordmark">Kahaani</div><span className="eyebrow">a kept memory</span></header><div className="memory-grid"><aside className="memory-left"><div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}><div className="avatar" style={{width:64,height:64}}/><div><div style={{fontSize:19,fontWeight:600}}>{memory.invitation.storytellerName}</div><div style={{color:"var(--muted)",fontSize:14}}>{memory.invitation.relationship}</div></div></div><h1 className="memory-title story-latin">{memory.invitation.questionOriginal}</h1><p className="memory-meta">{date} · {durationLabel(memory.durationSec)}</p><div className="language-switcher" style={{marginTop:24}}>{([original, ...(["en-IN","hi-IN","mr-IN"] as LanguageCode[]).filter((code)=>code!==original)]).map((code)=><button key={code} className={active===code ? "selected" : ""} onClick={()=>{setSelected(code);track("transcript_language_selected",{original_language:original,selected_language:code});}}>{code===original ? `${languageLabel(code)} · Original` : languageLabel(code)}</button>)}</div><div className="player card" style={{marginTop:20}}><div className="player-label"><Icon name="sound" size={19}/>Her original voice</div><div className="player-row"><audio ref={audioRef} src={memory.audioUrl ?? undefined} onPlay={()=>{setPlaying(true);if(!audioPlayedTracked.current){audioPlayedTracked.current=true;track("memory_audio_played",{original_language:original});}}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/><button className="play" aria-label={playing ? "Pause original recording" : "Play original recording"} onClick={()=>{const audio=audioRef.current;if(!audio)return;if(audio.paused) void audio.play();else audio.pause();}}><Icon name={playing ? "stop" : "play"} size={32}/></button><div style={{flex:1,minWidth:0}}><div className="stored-wave">{peaks.map((height,index)=><span key={index} style={{height}}/>)}</div><div className="player-time"><span>{playing ? "Playing" : "Ready"}</span><span>{durationLabel(memory.durationSec)}</span></div></div></div><div className="player-footer"><span className={languageMeta[original].storyClass} style={{color:"var(--ink2)",fontWeight:500}}>{languageLabel(original)}</span> · Recorded as she spoke it</div></div>{memory.processingStatus !== "ready" && <div className="processing-note">The original recording is here. We&apos;re quietly preparing the written version.</div>}</aside><section className="memory-right"><div className="eyebrow" style={{color:active===original?"var(--voice)":"var(--translation)",marginBottom:16}}>{active===original ? `In her words · ${languageLabel(original)}` : `From ${languageLabel(original)}`}</div>{transcript ? <article className={`transcript ${languageMeta[active].storyClass}`}>{paragraphs.map((paragraph,index)=><p key={index} style={{margin:"0 0 20px"}}>{paragraph}</p>)}</article> : <div className="unavailable"><strong>{active===original ? "Her original words are still being prepared." : `${languageLabel(active)} is not ready yet.`}</strong><br/>You can always listen to her original voice above.</div>}</section></div></main>;
}
