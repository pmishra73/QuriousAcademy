import { NextRequest, NextResponse } from "next/server";
import { getMergedVariants, type MergedVariant } from "@/lib/courseOverrides";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSchedule(v: MergedVariant): string {
  if (v.effectiveScheduleDates.length > 0) {
    return v.effectiveScheduleDates.slice(0, 2).join(", ");
  }
  const s = v.schedule as { rule?: string; time?: string } | null | undefined;
  if (!s) return "Rolling start dates";
  const rule = s.rule ?? "";
  const time = s.time ?? "";
  const ruleMap: Record<string, string> = {
    "monthly-first-saturday": "Monthly · 1st Sat",
    "tue-thu-sat-8pm": "Tue / Thu / Sat",
    "weekends": "Weekends",
    "weekdays": "Weekdays",
  };
  const label = ruleMap[rule] ?? rule.replace(/-/g, " ");
  return time ? `${label} · ${time}` : label;
}

function instructorBio(v: MergedVariant): { p1: string; p2: string } {
  const subj = (v.subjectLabel ?? "").toLowerCase();
  const id = v.id.toLowerCase();

  if (id.includes("dsa") || subj.includes("algorithm") || subj.includes("data structure")) {
    return {
      p1: `Prasant has both conducted technical interviews and prepared candidates for them over his career. He's seen which preparation strategies lead to consistent performance and which lead to candidates who freeze when they see a problem that looks slightly different from what they practiced. The pattern-first approach in ${v.title} is a direct response to that observation.`,
      p2: `His focus in mock interviews is on the thinking process as much as the solution — because interviewers are evaluating how you think, communicate, and handle uncertainty. The frameworks you'll build in this course are the same ones he uses when evaluating candidates.`,
    };
  }
  if (subj.includes("artificial intelligence") || subj.includes("genai") || id.includes("ai") || id.includes("genai")) {
    return {
      p1: `Prasant has spent years working at the intersection of AI research and real-world deployment — building LLM-powered products, fine-tuning models, and advising companies on AI strategy. ${v.title} reflects what he wishes he had when he was navigating this space: a structured, practical path through a landscape full of noise.`,
      p2: `He believes the biggest gap in AI education is the leap from "I understand the concepts" to "I can ship something real." This course is designed to close exactly that gap — every session ties theory directly to something you can build and use.`,
    };
  }
  if (subj.includes("python") || id.includes("python")) {
    return {
      p1: `Prasant has taught Python to over 2,500 students — from fresh graduates learning their first programming language to senior professionals automating workflows they once thought required a dedicated developer. ${v.title} reflects what he's found to be the fastest path from zero to genuine productivity.`,
      p2: `His teaching philosophy is rooted in the belief that syntax is the easy part — the hard part is building a programmer's intuition for breaking problems down. Every session is designed to give you both the language and the mental model.`,
    };
  }
  if (subj.includes("backend") || subj.includes("system") || id.includes("backend") || id.includes("system")) {
    return {
      p1: `Prasant has designed and built backend systems at scale — from high-throughput APIs to distributed data pipelines. ${v.title} distils the patterns he's applied repeatedly across different stacks and problem domains, presented in the order that builds the clearest mental model.`,
      p2: `He's found that most backend struggles come not from lack of knowledge but from not knowing which abstractions to reach for. The goal of this course is to give you a reliable decision framework, not just a list of technologies.`,
    };
  }
  if (subj.includes("react") || subj.includes("web") || id.includes("webdev") || id.includes("react")) {
    return {
      p1: `Prasant has shipped production React applications and worked with frontend teams ranging from solo developers to large engineering orgs. ${v.title} is structured around the decisions he makes daily — component design, state management, and the reasoning behind each.`,
      p2: `He believes modern frontend development is genuinely hard, and that most courses underestimate how much clarity comes from understanding the "why" behind framework choices. This course prioritises that clarity over breadth.`,
    };
  }
  if (subj.includes("calculus") || subj.includes("linear algebra") || subj.includes("math") || id.includes("calc") || id.includes("maths")) {
    return {
      p1: `Prasant approaches mathematics as a language for describing the world precisely — one that unlocks everything from machine learning to financial modelling. ${v.title} is built on the principle that mathematical intuition comes before symbol manipulation, not after.`,
      p2: `He's seen too many students memorise procedures without understanding why they work. Every concept in this course is introduced through motivation first: here's the problem, here's why the standard approach fails, here's why this idea solves it.`,
    };
  }
  if (subj.includes("chemistry") || id.includes("chemistry")) {
    return {
      p1: `Prasant connects chemistry to its real-world applications in every session — because memorising reactions without understanding the underlying principles is both tedious and fragile. ${v.title} is built on the insight that students who understand the "why" behind a reaction remember it without effort.`,
      p2: `His teaching approach emphasises the connections between topics that textbooks often treat as separate — bonding theory, thermodynamics, and kinetics aren't isolated chapters, they're lenses on the same fundamental behaviour of matter.`,
    };
  }
  if (subj.includes("physics") || id.includes("physics")) {
    return {
      p1: `Prasant teaches physics as a discipline in problem-solving, not just formula application. ${v.title} is structured around the handful of core principles that underlie the entire discipline — master these, and most problems become variations on a theme.`,
      p2: `He's guided students through everything from board exam preparation to undergraduate-level physics, and the consistent finding is that conceptual clarity accelerates everything else. This course builds that clarity first.`,
    };
  }
  if (subj.includes("interview") || id.includes("interview")) {
    return {
      p1: `Prasant has been on both sides of the hiring table — conducting interviews at tech companies and coaching candidates through the process. ${v.title} is built from direct observation of what separates candidates who clear interviews consistently from those who don't.`,
      p2: `His coaching focuses as much on how you communicate and structure your thinking as on the correctness of your answers — because interviewers are evaluating a potential colleague, not just a problem-solver. This course prepares you for the full picture.`,
    };
  }
  // Default / finance
  return {
    p1: `Prasant brings over 14 years of hands-on experience across finance, technology, and education to ${v.title}. He's held roles spanning equity research, investment banking, and GenAI consulting — and designed this course to give you the frameworks he uses in practice, not a textbook-only view.`,
    p2: `His teaching philosophy is to start with the question every practitioner actually asks — not "what is this concept?" but "when do I use this, and why does it work?" Every session in this course is structured around that practitioner's perspective.`,
  };
}

function fitContent(v: MergedVariant): { yes: string[]; no: string[] } {
  const subj = (v.subjectLabel ?? "").toLowerCase();
  const id = v.id.toLowerCase();
  const isIntermediate = (v.level ?? "").toLowerCase().includes("intermediate");
  const isAdvanced = (v.level ?? "").toLowerCase().includes("advanced");

  if (id.includes("dsa") || subj.includes("algorithm")) {
    return {
      yes: [
        "You're preparing for technical interviews at product companies (startups, mid-size, or FAANG-adjacent) and want a structured, pattern-based approach",
        "You've tried grinding LeetCode on your own and find yourself stuck on medium problems without a clear methodology",
        "You're a developer who codes daily but hasn't formally studied algorithms",
        "You have an interview coming up in 2–3 months and want focused, accountable preparation",
      ],
      no: [
        "You can't write basic code yet — you need to be comfortable with loops, functions, and basic data types in at least one language first",
        "You're looking for system design or behavioural interview prep — this course focuses entirely on data structures and algorithm problems",
        "You want a comprehensive CS degree curriculum — this is scoped specifically to interview preparation",
      ],
    };
  }
  if (subj.includes("artificial intelligence") || id.includes("ai") || id.includes("genai")) {
    return {
      yes: [
        "You want to build real AI-powered products and need a structured path from theory to shipping",
        "You follow the AI space closely but struggle to connect what you read to what you can actually build",
        isIntermediate ? "You have a programming background and want to go from 'I've used ChatGPT' to 'I built this'" : "You're curious about AI and want to understand how it works, not just how to use it",
        "You want to work in AI or add AI capabilities to your existing projects",
      ],
      no: [
        "You have no programming experience — some Python or JavaScript basics are required to get full value from the hands-on sessions",
        "You're looking for academic AI research — this course focuses on practical application and building",
        "You already have deep expertise in ML engineering — this is designed for practitioners moving into AI, not ML PhDs",
      ],
    };
  }
  return {
    yes: [
      `You're ${isAdvanced ? "an experienced professional wanting to deepen expertise" : isIntermediate ? "someone with foundational knowledge ready to go further" : "starting fresh and want a structured, clear path"} in ${v.subjectLabel}`,
      `You want to learn by doing — with projects, exercises, and live instruction rather than passive video-watching`,
      `You value efficiency: you'd rather spend focused hours on the right material than months on self-directed study`,
      `You want expert feedback and a structured environment to stay accountable`,
    ],
    no: [
      v.content.prerequisites
        ? `You don't yet meet the prerequisites: ${v.content.prerequisites.split(".")[0]}`
        : "You're looking for a quick overview rather than a thorough, skill-building course",
      "You prefer entirely self-paced learning with no live component — this course includes scheduled live sessions",
      "You already have advanced expertise in this area and are looking for highly specialised material",
    ],
  };
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const all = await getMergedVariants();
  const v = all.find((c) => c.id === courseId);
  if (!v) return new NextResponse("Course not found", { status: 404 });

  const bio = instructorBio(v);
  const fit = fitContent(v);
  const schedule = fmtSchedule(v);
  const deliveryTag = [v.deliveryMode, v.type.replace(/-/g, " ")].join(" · ").toUpperCase();

  // Group sessions into blocks of up to 4 for display
  const sessionBlocks: Array<{ label: string; title: string; topics: { name: string }[] }> = [];
  const sessions = v.content.sessions;
  const blockSize = sessions.length <= 6 ? 2 : sessions.length <= 10 ? 3 : 4;
  for (let i = 0; i < sessions.length; i += blockSize) {
    const chunk = sessions.slice(i, i + blockSize);
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    const label =
      chunk.length === 1
        ? `${first.session}`
        : `${first.session} – ${last.session}`;
    const allTopics = chunk.flatMap((s) =>
      s.topics.map((t) => ({ name: t }))
    );
    sessionBlocks.push({
      label,
      title: chunk.length === 1 ? first.title : `${first.title} & More`,
      topics: allTopics,
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${v.title} — Course Brochure | Qurious Academy</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --primary: #6366f1; --primary-light: #818cf8; --primary-dark: #4f46e5;
  --accent: #a78bfa; --accent-2: #34d399;
  --bg: #09090f; --surface: #0f0f1a; --surface-2: #161624; --surface-3: #1c1c2e;
  --border: rgba(255,255,255,0.07); --border-strong: rgba(255,255,255,0.12);
  --text: #f1f1f8; --text-dim: #9494b0; --text-muted: #5a5a78;
  --green: #34d399; --red: #f87171;
  --grad-primary: linear-gradient(135deg,#6366f1,#a78bfa);
  --grad-cover: linear-gradient(160deg,#0f0f1a 0%,#0d0d1e 60%,#0a0a18 100%);
}
html, body {
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  background: var(--bg); color: var(--text);
  font-size: 13px; line-height: 1.6;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  -webkit-font-smoothing: antialiased;
}
.page { width: 794px; min-height: 1123px; margin: 0 auto 2px; background: var(--bg); position: relative; overflow: hidden; page-break-after: always; }

/* COVER */
.cover { background: var(--grad-cover); min-height: 1123px; display: flex; flex-direction: column; position: relative; }
.cover::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px), linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse 70% 60% at 70% 40%,black 0%,transparent 80%); pointer-events: none; }
.cover::after { content: ''; position: absolute; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle,rgba(99,102,241,0.18) 0%,rgba(99,102,241,0.06) 45%,transparent 70%); top: -80px; right: -100px; pointer-events: none; }
.cover-top { position: relative; z-index: 2; padding: 36px 52px 0; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 17px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
.logo span { color: var(--primary-light); }
.subject-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; border: 1px solid rgba(99,102,241,0.35); background: rgba(99,102,241,0.1); color: var(--primary-light); }
.cover-hero { position: relative; z-index: 2; flex: 1; padding: 56px 52px 40px; display: flex; flex-direction: column; justify-content: center; }
.delivery-tag { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 5px 14px 5px 10px; border-radius: 100px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.28); color: var(--accent-2); margin-bottom: 28px; width: fit-content; }
.delivery-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-2); box-shadow: 0 0 6px var(--accent-2); display: inline-block; }
.cover-title { font-size: 56px; font-weight: 900; line-height: 1.0; letter-spacing: -0.04em; margin-bottom: 22px; color: var(--text); }
.cover-title .highlight { background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.cover-tagline { font-size: 16px; color: var(--text-dim); line-height: 1.75; max-width: 520px; margin-bottom: 52px; }
.cover-stats { display: flex; border: 1px solid var(--border-strong); border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.03); max-width: 660px; }
.stat { flex: 1; padding: 18px 16px; border-right: 1px solid var(--border); }
.stat:last-child { border-right: none; }
.stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 5px; }
.stat-value { font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.2; }
.stat-value.price { font-size: 20px; font-weight: 800; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.cover-footer { position: relative; z-index: 2; padding: 24px 52px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
.instructor-line { display: flex; align-items: center; gap: 14px; }
.instructor-avatar { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(99,102,241,0.3); }
.instructor-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.instructor-name { font-size: 13px; font-weight: 600; color: var(--text); }
.instructor-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

/* INNER PAGES */
.inner-page { padding: 52px 52px 44px; min-height: 1123px; background: var(--bg); position: relative; }
.inner-page::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,var(--primary) 0%,var(--accent) 50%,transparent 100%); }
.section-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: var(--primary-light); margin-bottom: 8px; }
.section-title { font-size: 26px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 22px; color: var(--text); }
.section-divider { height: 1px; background: var(--border); margin: 36px 0; }
.overview-text { font-size: 13.5px; color: var(--text-dim); line-height: 1.85; }

/* FIT GRID */
.fit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 4px; }
.fit-card { border-radius: 14px; padding: 24px; background: var(--surface-2); border: 1px solid var(--border); position: relative; overflow: hidden; }
.fit-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.fit-card.yes::before { background: var(--green); }
.fit-card.no::before { background: var(--red); }
.fit-card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
.fit-card.yes .fit-card-title { color: var(--green); }
.fit-card.no .fit-card-title { color: var(--red); }
.fit-list { list-style: none; display: flex; flex-direction: column; gap: 11px; }
.fit-list li { font-size: 12.5px; color: var(--text-dim); line-height: 1.6; padding-left: 18px; position: relative; }
.fit-list li::before { position: absolute; left: 0; top: 0; font-size: 11px; }
.fit-card.yes .fit-list li::before { content: '✓'; color: var(--green); }
.fit-card.no .fit-list li::before { content: '✗'; color: var(--red); }
.prereq-box { margin-top: 18px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2); border-left: 3px solid var(--primary); border-radius: 0 10px 10px 0; padding: 14px 18px; font-size: 12.5px; color: var(--text-dim); line-height: 1.65; }
.prereq-box strong { color: var(--primary-light); font-weight: 700; }

/* CURRICULUM */
.session-block { display: grid; grid-template-columns: 150px 1fr; gap: 0; margin-bottom: 10px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--surface-2); }
.session-header { background: var(--surface-3); border-right: 1px solid var(--border); padding: 20px 16px; display: flex; flex-direction: column; gap: 10px; justify-content: flex-start; }
.session-pill { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 100px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: var(--primary-light); width: fit-content; }
.session-name { font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.3; }
.topic-list { list-style: none; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
.topic-list li { font-size: 12px; color: var(--text-dim); line-height: 1.6; padding-left: 14px; position: relative; }
.topic-list li::before { content: '▸'; position: absolute; left: 0; top: 2px; color: var(--primary-light); font-size: 9px; }

/* OUTCOMES */
.outcomes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
.outcome-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: flex-start; position: relative; overflow: hidden; }
.outcome-card::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; background: var(--grad-primary); }
.outcome-num { font-size: 24px; font-weight: 900; line-height: 1; color: rgba(99,102,241,0.2); flex-shrink: 0; letter-spacing: -0.04em; min-width: 28px; }
.outcome-text { font-size: 12.5px; color: var(--text-dim); line-height: 1.65; padding-top: 2px; }
.outcome-text strong { color: var(--text); font-weight: 600; display: block; margin-bottom: 3px; font-size: 13px; }

/* INCLUDES */
.includes-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.includes-list li { display: flex; align-items: flex-start; gap: 11px; font-size: 12.5px; color: var(--text-dim); padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; line-height: 1.55; }
.check-icon { width: 18px; height: 18px; border-radius: 50%; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 10px; flex-shrink: 0; margin-top: 1px; }
.includes-list li strong { color: var(--text); font-weight: 600; }

/* LOGISTICS */
.logistics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
.logistics-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
.logistics-card-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 5px; }
.logistics-card-value { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.3; }
.price-highlight { color: var(--primary-light) !important; font-size: 18px !important; }

/* INSTRUCTOR */
.instructor-card { background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: 16px; padding: 32px 36px; display: flex; gap: 32px; align-items: flex-start; position: relative; overflow: hidden; }
.instructor-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--grad-primary); }
.instructor-photo { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 0 0 4px rgba(99,102,241,0.2), 0 8px 24px rgba(99,102,241,0.2); }
.instructor-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.instructor-photo-fallback { width: 80px; height: 80px; border-radius: 50%; background: var(--grad-primary); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: white; flex-shrink: 0; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
.instructor-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 14px; }
.instructor-tag { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 100px; background: rgba(99,102,241,0.1); color: var(--primary-light); border: 1px solid rgba(99,102,241,0.2); }
.instructor-bio { font-size: 12.5px; color: var(--text-dim); line-height: 1.8; }

/* BACK COVER */
.back-cover { background: var(--grad-cover); min-height: 1123px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 52px; text-align: center; position: relative; overflow: hidden; }
.back-cover::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px), linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse 60% 80% at 50% 50%,black 0%,transparent 80%); }
.back-cover::after { content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-50%); }
.back-cover > * { position: relative; z-index: 2; }
.back-cover-logo { font-size: 24px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 12px; color: var(--text); }
.back-cover-logo span { color: var(--primary-light); }
.back-cover-tagline { font-size: 13px; color: var(--text-dim); margin-bottom: 52px; max-width: 380px; line-height: 1.75; }
.cta-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border-strong); border-radius: 20px; padding: 36px 52px; max-width: 440px; width: 100%; margin-bottom: 44px; position: relative; overflow: hidden; }
.cta-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--grad-primary); }
.cta-course-title { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; color: var(--text); }
.cta-meta { font-size: 11px; color: var(--text-muted); margin-bottom: 20px; }
.cta-price { font-size: 44px; font-weight: 900; letter-spacing: -0.04em; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 24px; line-height: 1; }
.cta-button { display: block; background: var(--grad-primary); color: white; padding: 13px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; margin-bottom: 12px; letter-spacing: -0.01em; }
.cta-url { font-size: 12px; color: var(--text-muted); }
.back-contact { font-size: 12px; color: var(--text-muted); line-height: 2; }
.back-contact a { color: var(--primary-light); text-decoration: none; }

@media print { body { background: var(--bg); } .page { margin: 0; page-break-after: always; } }
</style>
</head>
<body>

<!-- PAGE 1 — COVER -->
<div class="page cover">
  <div class="cover-top">
    <div class="logo">Qurious<span>Academy</span></div>
    <div class="subject-badge">${v.subjectLabel}</div>
  </div>
  <div class="cover-hero">
    <div class="delivery-tag">${deliveryTag}</div>
    <div class="cover-title">${v.title.replace(/—/, "—<br/>")}<br/><span class="highlight">${v.duration}</span></div>
    <div class="cover-tagline">${v.tagline}</div>
    <div class="cover-stats">
      <div class="stat"><div class="stat-label">Price</div><div class="stat-value price">₹${v.price.toLocaleString("en-IN")}</div></div>
      <div class="stat"><div class="stat-label">Duration</div><div class="stat-value">${v.duration}</div></div>
      <div class="stat"><div class="stat-label">Level</div><div class="stat-value">${v.level}</div></div>
      <div class="stat"><div class="stat-label">Format</div><div class="stat-value">${v.deliveryMode}</div></div>
      <div class="stat"><div class="stat-label">Schedule</div><div class="stat-value">${schedule}</div></div>
    </div>
  </div>
  <div class="cover-footer">
    <div class="instructor-line">
      <div class="instructor-avatar">
        <img src="/founder.png" alt="${v.instructor}" onerror="this.parentElement.style.background='linear-gradient(135deg,#6366f1,#a78bfa)';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.fontSize='15px';this.parentElement.style.fontWeight='800';this.parentElement.style.color='white';this.parentElement.innerHTML='${v.instructor[0]}';" />
      </div>
      <div>
        <div class="instructor-name">${v.instructor}</div>
        <div class="instructor-role">Founder &amp; Instructor, Qurious Academy</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-muted);">quriousacademy.com</div>
  </div>
</div>

<!-- PAGE 2 — ABOUT + FIT -->
<div class="page inner-page">
  <div class="section-label">About This Course</div>
  <div class="section-title">What is ${v.title}?</div>
  ${(v.content.overview.includes("\n\n") ? v.content.overview.split("\n\n") : [v.content.overview]).filter(Boolean).map((p: string) => `<p class="overview-text" style="margin-bottom:14px;">${p.trim()}</p>`).join("")}

  <div class="section-divider"></div>
  <div class="section-label">Is This Right for You?</div>
  <div class="section-title">Who Should Enroll</div>
  <div class="fit-grid">
    <div class="fit-card yes">
      <div class="fit-card-title">✓ This is for you if…</div>
      <ul class="fit-list">
        ${fit.yes.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    <div class="fit-card no">
      <div class="fit-card-title">✗ This is NOT for you if…</div>
      <ul class="fit-list">
        ${fit.no.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  </div>
  ${v.content.prerequisites ? `<div class="prereq-box"><strong>Prerequisites:</strong> ${v.content.prerequisites}</div>` : ""}
</div>

<!-- PAGE 3 — CURRICULUM -->
<div class="page inner-page">
  <div class="section-label">Curriculum</div>
  <div class="section-title">${v.content.sessions.length} Sessions — ${v.duration}</div>
  ${sessionBlocks.map((block) => `
  <div class="session-block">
    <div class="session-header">
      <div class="session-pill">${block.label}</div>
      <div class="session-name">${block.title}</div>
    </div>
    <ul class="topic-list">
      ${block.topics.map((t) => `<li>${t.name}</li>`).join("")}
    </ul>
  </div>`).join("")}
</div>

<!-- PAGE 4 — OUTCOMES + INCLUDES + LOGISTICS -->
<div class="page inner-page">
  <div class="section-label">Learning Outcomes</div>
  <div class="section-title">What You'll Walk Away With</div>
  <div class="outcomes-grid">
    ${v.content.outcomes.map((o: string, i: number) => {
      const parts = o.split(" — ");
      const title = parts[0];
      const desc = parts.slice(1).join(" — ");
      return `<div class="outcome-card">
        <div class="outcome-num">0${i + 1}</div>
        <div class="outcome-text"><strong>${title}</strong>${desc ? ` — ${desc}` : ""}</div>
      </div>`;
    }).join("")}
  </div>

  <div class="section-divider"></div>
  <div class="section-label">What's Included</div>
  <div class="section-title">Everything You Get</div>
  <ul class="includes-list">
    ${v.content.includes.map((item: string) => {
      const parts = item.split(" — ");
      const title = parts[0];
      const desc = parts.slice(1).join(" — ");
      return `<li><div class="check-icon">✓</div><div><strong>${title}</strong>${desc ? ` — ${desc}` : ""}</div></li>`;
    }).join("")}
  </ul>

  <div class="section-divider"></div>
  <div class="section-label">Logistics</div>
  <div class="section-title">Schedule &amp; Pricing</div>
  <div class="logistics-grid">
    <div class="logistics-card"><div class="logistics-card-label">Format</div><div class="logistics-card-value">${v.deliveryMode}</div></div>
    <div class="logistics-card"><div class="logistics-card-label">Schedule</div><div class="logistics-card-value">${schedule}</div></div>
    <div class="logistics-card"><div class="logistics-card-label">Duration</div><div class="logistics-card-value">${v.duration} · ${v.content.sessions.length} sessions</div></div>
    <div class="logistics-card"><div class="logistics-card-label">Price</div><div class="logistics-card-value price-highlight">₹${v.price.toLocaleString("en-IN")}${v.recordedPrice ? ` / ₹${v.recordedPrice.toLocaleString("en-IN")} recorded` : ""}</div></div>
  </div>
  ${v.content.certificate ? `<div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);border-radius:10px;padding:14px 20px;display:flex;align-items:center;gap:12px;font-size:13px;color:#fbbf24;"><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;background:rgba(234,179,8,0.15);border:1px solid rgba(234,179,8,0.3);color:#fbbf24;white-space:nowrap;">CERT</span>${v.content.certificate}</div>` : ""}
</div>

<!-- PAGE 5 — INSTRUCTOR -->
<div class="page inner-page">
  <div class="section-label">Your Instructor</div>
  <div class="section-title">About ${v.instructor}</div>
  <div class="instructor-card">
    <div class="instructor-photo">
      <img src="/founder.png" alt="${v.instructor}" />
    </div>
    <div style="flex:1;">
      <div style="font-size:20px;font-weight:700;margin-bottom:4px;">${v.instructor}</div>
      <div style="font-size:13px;color:var(--primary-light);margin-bottom:10px;">Founder &amp; Instructor — Qurious Academy</div>
      <div class="instructor-tags">
        <span class="instructor-tag">GenAI Solutions Architect</span>
        <span class="instructor-tag">15+ Yrs Teaching</span>
        <span class="instructor-tag">2500+ Students</span>
        <span class="instructor-tag">60+ Projects Delivered</span>
      </div>
      <p class="instructor-bio">${bio.p1}</p>
      <p class="instructor-bio" style="margin-top:12px;">${bio.p2}</p>
    </div>
  </div>
</div>

<!-- PAGE 6 — BACK COVER -->
<div class="page back-cover">
  <div class="back-cover-logo">Qurious<span>Academy</span></div>
  <div class="back-cover-tagline">Focused, live learning for curious minds. No fluff — just the concepts that matter.</div>
  <div class="cta-box">
    <div class="cta-course-title">${v.title}</div>
    <div class="cta-meta">${v.deliveryMode} · ${schedule} · Rolling start dates</div>
    <div class="cta-price">₹${v.price.toLocaleString("en-IN")}</div>
    <a href="https://quriousacademy.com/enroll?course=${v.id}" class="cta-button">Enroll at quriousacademy.com →</a>
    <div class="cta-url">or visit quriousacademy.com/courses</div>
  </div>
  <div class="back-contact">
    Questions? Reach us at <a href="mailto:hello@quriousacademy.com">hello@quriousacademy.com</a><br/>
    © 2025 Qurious Academy. All rights reserved.
  </div>
</div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
