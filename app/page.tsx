import Link from "next/link";
import { HeroIllustration, Icon } from "@/components/illustrations";

export default function LandingPage() {
  return <main className="landing"><header className="top"><div className="wordmark">Kahaani</div><Link href="/memories" className="quiet-button" style={{width:"auto",textDecoration:"none"}}>View memories</Link></header><section className="hero"><div><h1>The stories that made us.</h1><p>Ask someone you love one small question. They can answer in their own voice, in the language that feels like home.</p></div><HeroIllustration/><Link href="/create" className="primary" style={{ textDecoration:"none" }}><Icon name="mic"/>Preserve a memory</Link></section></main>;
}
