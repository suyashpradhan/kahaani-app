"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icon, SettleIllustration } from "@/components/illustrations";

export function MemoryStatus({ shareToken }: { shareToken: string }) {
  const invitation = useQuery(api.invitations.getStory, { shareToken });
  const memory = useQuery(api.memories.getForInvitation, invitation ? { invitationId: invitation._id } : "skip");

  if (invitation === undefined) return <main className="page"><div className="shell"><header style={{display:"flex",justifyContent:"space-between",marginBottom:48}}><div className="wordmark">Kahaani</div></header><p style={{color:"var(--muted)"}}>Opening this request…</p></div></main>;
  if (!invitation) return <main className="page"><div className="shell"><header style={{display:"flex",justifyContent:"space-between",marginBottom:48}}><div className="wordmark">Kahaani</div></header><div className="unavailable">This private request could not be found.</div></div></main>;

  const waiting = !memory && ["created", "opened", "recording"].includes(invitation.status);
  const processing = memory && ["audio-saved", "transcribing", "translating"].includes(memory.processingStatus);
  const ready = memory && memory.processingStatus === "ready";
  const needsHelp = memory && memory.processingStatus === "failed";

  return <main className="page"><div className="shell" style={{maxWidth:620}}><header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:42}}><div className="wordmark">Kahaani</div><span className="eyebrow">private request</span></header><section className="card" style={{padding:26}}><div className="eyebrow">For {invitation.storytellerName}</div><h1 className="memory-title" style={{fontSize:"clamp(30px,7vw,42px)",marginTop:8}}>{invitation.questionLocalized}</h1><p style={{color:"var(--ink2)",fontSize:17,lineHeight:1.55,margin:"16px 0 0"}}>Asked by {invitation.hostName} · {invitation.relationship}</p></section>
    <section style={{minHeight:290,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:16,padding:"42px 10px"}}>
      {(waiting || processing) && <><SettleIllustration/><h2 className="memory-title" style={{fontSize:34,margin:0}}>{waiting ? "Waiting for her story…" : "Keeping this memory…"}</h2><p style={{maxWidth:380,margin:0,color:"var(--ink2)",fontSize:18,lineHeight:1.55}}>{waiting ? `${invitation.storytellerName} has the private link. When she records, her original voice will appear here.` : "The original recording is already safe. We’re quietly preparing the words."}</p></>}
      {ready && <><SettleIllustration/><h2 className="memory-title" style={{fontSize:34,margin:0}}>Her memory is ready.</h2><p style={{maxWidth:380,margin:0,color:"var(--ink2)",fontSize:18,lineHeight:1.55}}>Listen to her original voice and read the story in Hindi or English.</p><Link href={`/memory/${memory.memoryToken}`} className="primary" style={{marginTop:8,textDecoration:"none",maxWidth:410}}><Icon name="sound"/>Open {invitation.storytellerName}&apos;s memory</Link></>}
      {needsHelp && <><div className="error-disc"><Icon name="micOff" size={46}/></div><h2 className="memory-title" style={{fontSize:34,margin:0}}>Her recording is here.</h2><p style={{maxWidth:380,margin:0,color:"var(--ink2)",fontSize:18,lineHeight:1.55}}>The written version needs another try, but the original voice is safe and ready to hear.</p><Link href={`/memory/${memory.memoryToken}`} className="secondary" style={{marginTop:8,textDecoration:"none",maxWidth:410}}><Icon name="sound"/>Open original recording</Link></>}
    </section>
  </div></main>;
}
