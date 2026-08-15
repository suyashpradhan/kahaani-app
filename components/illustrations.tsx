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
  return <svg className="hero-art" viewBox="0 0 390 250" role="img" aria-label="A grandmother's spoken story becoming a kept memory">
    <rect width="390" height="250" rx="24" fill="#F7EFE3"/>
    <path d="M34 210h322" stroke="#DCC7AC" strokeWidth="2" strokeLinecap="round"/>
    <g transform="translate(47 48)">
      <path d="M18 160V101c0-28 23-45 52-45s52 17 52 45v59" fill="#C98262" stroke="#A94E2B" strokeWidth="2.5"/>
      <circle cx="70" cy="43" r="34" fill="#D08A63" stroke="#A94E2B" strokeWidth="2.5"/>
      <path d="M38 39c2-29 56-35 65-3v-12C84 0 52 4 37 25Z" fill="#6F3A31"/>
      <path d="M46 42h14m20 0h14M60 42h20" stroke="#241C17" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
      <circle cx="53" cy="42" r="2" fill="#241C17"/><circle cx="87" cy="42" r="2" fill="#241C17"/>
      <path d="M60 59c6 5 13 5 19 0" fill="none" stroke="#7C3B33" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 111c12 12 27 18 40 18s28-6 40-18" fill="none" stroke="#F4E2D4" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
      <path d="M44 160v-34h52v34" fill="#B66B50" opacity=".6"/>
    </g>
    <g style={{ transformOrigin:"192px 118px", animation:"breathe 7s ease-in-out infinite" }}>
      <path d="M158 109h8m8-14v28m8-41v54m8-30v6m8-20v46" stroke="#A94E2B" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="149" cy="109" r="3" fill="#A94E2B"/>
    </g>
    <g transform="translate(224 57)">
      <rect width="119" height="120" rx="14" fill="#FFFDF8" stroke="#A94E2B" strokeWidth="2"/>
      <path d="M22 32h66M22 49h78M22 66h56M22 83h72" stroke="#5C4E44" strokeWidth="4" strokeLinecap="round" opacity=".52"/>
      <path d="M22 102q6-7 12 0t12 0t12 0" fill="none" stroke="#A94E2B" strokeWidth="2.5" strokeLinecap="round"/>
    </g>
    <path d="M160 195q7-8 14 0t14 0t14 0" fill="none" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round" opacity=".6"/>
  </svg>;
}

export function PromptCue() { return <svg className="prompt-cue" viewBox="0 0 128 80" aria-hidden="true"><path d="M6 70h118" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round" opacity=".32"/><path d="m13 42 18-16 18 16" fill="#D08A63" stroke="#A94E2B" strokeWidth="2" strokeLinejoin="round"/><path d="M17 42h28v28H17z" fill="#EFE4D3" stroke="#A94E2B" strokeWidth="2"/><path d="M28 70V56h8v14" fill="none" stroke="#A94E2B" strokeWidth="2"/><path d="M88 70V37" stroke="#6B8A5A" strokeWidth="2"/><g style={{ transformOrigin:"88px 49px", animation:"breathe 8s ease-in-out infinite" }}><circle cx="88" cy="34" r="12" fill="#6B8A5A"/><circle cx="76" cy="43" r="9" fill="#6B8A5A"/><circle cx="100" cy="45" r="10" fill="#6B8A5A"/></g><circle cx="62" cy="62" r="7" fill="#5B7C8D" stroke="#33566A" strokeWidth="2"/></svg>; }

export function SettleIllustration() { return <svg className="settle-art" viewBox="0 0 200 120" aria-hidden="true"><g style={{ transformOrigin:"100px 60px", animation:"settleBars 4.2s ease-in-out infinite" }}>{[28,48,20,60,32,44,16].map((height,index)=><rect key={index} x={58+index*12} y={60-height/2} width="5" height={height} rx="2.5" fill="#A94E2B"/>)}</g><g style={{ transformOrigin:"100px 60px", animation:"settleCard 4.2s ease-in-out infinite" }}><rect x="50" y="24" width="100" height="72" rx="10" fill="#FFFDF8" stroke="#A94E2B" strokeWidth="2"/><path d="M62 43h60M62 55h76M62 67h48" stroke="#241C17" strokeWidth="3" strokeLinecap="round" opacity=".45"/><path d="M62 80q5-6 10 0t10 0" fill="none" stroke="#A94E2B" strokeWidth="2" strokeLinecap="round"/></g></svg>; }
