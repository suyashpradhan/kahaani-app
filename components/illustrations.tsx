export function Icon({ name, size = 24 }: { name: "mic" | "sound" | "stop" | "play" | "check" | "copy" | "share" | "refresh" | "micOff"; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "mic") return <svg {...props}><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg>;
  if (name === "sound") return <svg {...props}><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>;
  if (name === "stop") return <svg {...props}><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/></svg>;
  if (name === "play") return <svg {...props}><path d="m9 6 9 6-9 6V6Z" fill="currentColor" stroke="none"/></svg>;
  if (name === "check") return <svg {...props}><path d="m5 12 4 4L19 6"/></svg>;
  if (name === "copy") return <svg {...props}><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></svg>;
  if (name === "share") return <svg {...props}><path d="M12 16V3M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>;
  if (name === "refresh") return <svg {...props}><path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"/></svg>;
  return <svg {...props}><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 8.5 6.8M12 18v3M8 21h8M3 3l18 18"/></svg>;
}

export function HeroIllustration() {
  return <svg className="hero-art" viewBox="0 0 390 300" role="img" aria-label="An elder telling a story while memories of home drift nearby">
    <rect width="390" height="300" rx="24" fill="#F7EFE3"/><path d="M0 257H390" stroke="#DCC7AC"/>
    <g opacity=".9"><path d="M252 91 279 68l27 23" fill="#D08A63" stroke="#A94E2B" strokeWidth="2" strokeLinejoin="round"/><rect x="257" y="91" width="44" height="37" rx="2" fill="#EFE4D3" stroke="#A94E2B" strokeWidth="2"/><path d="M276 128v-18h8v18" fill="none" stroke="#A94E2B" strokeWidth="2"/></g>
    <g style={{ transformOrigin: "330px 111px", animation: "breathe 8s ease-in-out infinite" }}><path d="M330 139V93" stroke="#6B8A5A" strokeWidth="3" strokeLinecap="round"/><circle cx="330" cy="82" r="22" fill="#6B8A5A"/><circle cx="311" cy="93" r="17" fill="#6B8A5A"/><circle cx="349" cy="96" r="17" fill="#6B8A5A"/></g>
    <g transform="translate(54 126)"><path d="M15 113h143" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round" opacity=".3"/><path d="M41 111V54c0-25 21-38 41-38s40 13 40 38v57" fill="#E4B7A6" stroke="#A94E2B" strokeWidth="2"/><circle cx="82" cy="42" r="30" fill="#D08A63" stroke="#A94E2B" strokeWidth="2"/><path d="M54 35c3-24 46-29 57-4v-9c-17-23-50-22-60 3Z" fill="#7C3B33"/><circle cx="71" cy="42" r="2" fill="#241C17"/><circle cx="93" cy="42" r="2" fill="#241C17"/><path d="M74 56c5 4 11 4 16 0" fill="none" stroke="#7C3B33" strokeWidth="2" strokeLinecap="round"/><path d="M104 79c31 5 44 18 51 32" fill="none" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round"/><circle cx="159" cy="112" r="3" fill="#A94E2B"/></g>
    <path d="M180 259q7-9 14 0t14 0t14 0" fill="none" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round"/><path d="M222 259h107" stroke="#241C17" strokeWidth="2" strokeLinecap="round" opacity=".25"/>
  </svg>;
}

export function PromptCue() { return <svg className="prompt-cue" viewBox="0 0 128 80" aria-hidden="true"><path d="M6 70h118" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round" opacity=".32"/><path d="m13 42 18-16 18 16" fill="#D08A63" stroke="#A94E2B" strokeWidth="2" strokeLinejoin="round"/><path d="M17 42h28v28H17z" fill="#EFE4D3" stroke="#A94E2B" strokeWidth="2"/><path d="M28 70V56h8v14" fill="none" stroke="#A94E2B" strokeWidth="2"/><path d="M88 70V37" stroke="#6B8A5A" strokeWidth="2"/><g style={{ transformOrigin:"88px 49px", animation:"breathe 8s ease-in-out infinite" }}><circle cx="88" cy="34" r="12" fill="#6B8A5A"/><circle cx="76" cy="43" r="9" fill="#6B8A5A"/><circle cx="100" cy="45" r="10" fill="#6B8A5A"/></g><circle cx="62" cy="62" r="7" fill="#5B7C8D" stroke="#33566A" strokeWidth="2"/></svg>; }

export function SettleIllustration() { return <svg className="settle-art" viewBox="0 0 200 120" aria-hidden="true"><g style={{ transformOrigin:"100px 60px", animation:"settleBars 4.2s ease-in-out infinite" }}>{[28,48,20,60,32,44,16].map((height,index)=><rect key={index} x={58+index*12} y={60-height/2} width="5" height={height} rx="2.5" fill="#A94E2B"/>)}</g><g style={{ transformOrigin:"100px 60px", animation:"settleCard 4.2s ease-in-out infinite" }}><rect x="50" y="24" width="100" height="72" rx="10" fill="#FFFDF8" stroke="#A94E2B" strokeWidth="2"/><path d="M62 43h60M62 55h76M62 67h48" stroke="#241C17" strokeWidth="3" strokeLinecap="round" opacity=".45"/><path d="M62 80q5-6 10 0t10 0" fill="none" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round"/></g></svg>; }
