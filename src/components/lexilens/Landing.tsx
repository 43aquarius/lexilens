'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  Highlighter,
  Keyboard,
  Languages,
  Palette,
  ShieldCheck,
  Sparkles,
  Type,
  Volume2,
  Wand2,
  Accessibility,
  GraduationCap,
  HeartPulse,
  Globe,
  Eye,
} from 'lucide-react';
import { DEMO_BEFORE, DEMO_AFTER } from './types';

interface LandingProps {
  onStart: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI text simplification',
    body: 'One tap rewrites dense text at Easy or Easiest reading levels — facts kept, jargon dropped. Powered by a large language model, streamed live as it rewrites.',
  },
  {
    icon: Type,
    title: 'Dyslexia-friendly type',
    body: 'OpenDyslexic and Atkinson Hyperlegible fonts, generous line and letter spacing, adjustable text size — typography tuned to how dyslexic eyes track words.',
  },
  {
    icon: Volume2,
    title: 'Read-aloud karaoke',
    body: 'Choose a natural AI voice or instant browser voice. Words glow one by one as they are spoken, so eyes and ears read together.',
  },
  {
    icon: Crosshair,
    title: 'Focus mode & ruler',
    body: 'Dim everything except the line you are on, or guide your eyes with a translucent reading ruler that follows your cursor.',
  },
  {
    icon: Palette,
    title: 'Calm reading themes',
    body: 'Paper, cream, mint, night, and high-contrast black-on-white — because harsh white pages are a barrier, not a neutral choice.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'No account, no tracking, no storage. Your text is used only to simplify or read it, then forgotten. Settings live on your device.',
  },
];

const AUDIENCE = [
  { icon: Accessibility, title: 'Dyslexic readers', body: '1 in 10 people worldwide. Letters swim, lines get lost — LexiLens makes the page match their eyes.' },
  { icon: Eye, title: 'Low-vision readers', body: 'High-contrast themes, huge text, and clear speech for eyes that need a gentler page.' },
  { icon: Languages, title: 'English learners', body: 'Plain-language rewriting turns idioms and jargon into words you already know.' },
  { icon: HeartPulse, title: 'Patients & seniors', body: 'Medicine labels and clinic letters become sentences anyone can act on safely.' },
  { icon: GraduationCap, title: 'Students & researchers', body: 'Read a 40-page paper in half the time by starting at the Easiest level.' },
  { icon: Globe, title: 'Anyone tired', body: 'Dense terms of service at midnight? Let LexiLens read them to you.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Paste the hard thing',
    body: 'A prescription label, a lease clause, a research abstract — any text that made your eyes glaze over.',
  },
  {
    n: '02',
    title: 'One tap, new page',
    body: 'AI rewrites it at your reading level, and the typography adapts: font, spacing, theme, focus — all adjustable.',
  },
  {
    n: '03',
    title: 'Read or listen',
    body: 'Read it calmly yourself, or press Listen and follow the glowing words as a natural voice reads to you.',
  },
];

export default function Landing({ onStart }: LandingProps) {
  const [demoOn, setDemoOn] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf7f0] text-teal-950">
      {/* ======================= NAV ======================= */}
      <header className="sticky top-0 z-50 border-b border-teal-900/[0.07] bg-[#faf7f0]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5" aria-label="LexiLens home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/25">
              <BookOpen className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Lexi<span className="text-teal-700">Lens</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-teal-900/70 md:flex" aria-label="Main">
            <a href="#features" className="transition hover:text-teal-900">Features</a>
            <a href="#how" className="transition hover:text-teal-900">How it works</a>
            <a href="#who" className="transition hover:text-teal-900">Who it serves</a>
          </nav>
          <Button
            onClick={onStart}
            className="rounded-xl bg-teal-700 px-5 font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800"
          >
            Start reading free
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      {/* ======================= HERO ======================= */}
      <section id="top" className="hero-glow relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pb-24">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-800/15 bg-white px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                Built for the 700M+ readers the web forgot
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-6 text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-teal-950 sm:text-6xl"
            >
              Every word,
              <br />
              <span className="relative whitespace-nowrap">
                within reach.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-400"
                  viewBox="0 0 220 10"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 7.5C50 2.5 120 2.5 218 6.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 max-w-xl text-lg leading-relaxed text-teal-900/65"
            >
              Roughly <strong className="font-semibold text-teal-900">1 in 10 people</strong> live
              with dyslexia. Millions more struggle with low literacy, low vision, or a second
              language. LexiLens is a free AI reading suite that turns dense, stressful text into
              pages anyone can read — and hear.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                onClick={onStart}
                size="lg"
                className="h-14 rounded-2xl bg-teal-700 px-8 text-base font-semibold text-white shadow-xl shadow-teal-700/25 transition hover:bg-teal-800"
              >
                <Wand2 className="mr-2 h-5 w-5" aria-hidden />
                Try it — no account
              </Button>
              <Button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl border-2 border-teal-800/20 bg-transparent px-7 text-base font-semibold text-teal-900 transition hover:border-teal-700 hover:bg-white"
              >
                See the transformation
              </Button>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-5 flex items-center gap-2 text-sm text-teal-900/50"
            >
              <Keyboard className="h-4 w-4" aria-hidden />
              No sign-up · No tracking · Works with any text in any language
            </motion.p>
          </div>

          {/* Interactive mini-demo */}
          <motion.div
            id="demo"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teal-500/10 via-transparent to-amber-400/15 blur-lg" aria-hidden />
            <div className="relative rounded-[1.75rem] border border-teal-900/10 bg-white p-5 shadow-2xl shadow-teal-950/10 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-900/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-900/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-900/15" />
                </div>
                <button
                  onClick={() => setDemoOn((v) => !v)}
                  role="switch"
                  aria-checked={demoOn}
                  aria-label="Toggle LexiLens transformation"
                  className="flex items-center gap-2.5 rounded-full border border-teal-800/15 bg-[#faf7f0] py-1.5 pl-3 pr-1.5 transition hover:border-teal-700/40"
                >
                  <span className="text-xs font-bold text-teal-900">
                    LexiLens {demoOn ? 'on' : 'off'}
                  </span>
                  <span
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${demoOn ? 'bg-teal-600' : 'bg-teal-900/20'}`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${demoOn ? 'translate-x-5' : ''}`}
                    />
                  </span>
                </button>
              </div>

              <div className={`mini-demo-flip ${demoOn ? 'font-dyslexic' : ''}`}>
                {demoOn ? (
                  <div className="reader-theme-cream reader-canvas rounded-2xl p-6">
                    <p className="text-[19px] leading-[2] tracking-wide" style={{ letterSpacing: '0.04em' }}>
                      This medicine can make you feel sick in your stomach. Your doctor will tell
                      you what to watch for.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-700">
                      <Volume2 className="h-3.5 w-3.5" aria-hidden />
                      Reading level: Grade 3 · Listen available
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-teal-900/10 bg-[#fcfcfc] p-6">
                    <p className="font-sans text-[15px] leading-relaxed text-teal-950/80">
                      {DEMO_BEFORE}
                    </p>
                    <div className="mt-4 text-xs font-semibold text-teal-900/40">
                      Reading level: Grade 14 · OpenDyslexic: off
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-teal-900/45">
                A real line from a pharmacy leaflet — flip the switch and see what LexiLens does.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================= STATS ======================= */}
      <section aria-label="The problem in numbers" className="border-y border-teal-900/[0.07] bg-white/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {[
            { big: '700M+', small: 'people worldwide are estimated to have dyslexia — about 1 in 10.' },
            { big: '48M', small: 'U.S. adults read at or below a 5th-grade level, cut off from everyday documents.' },
            { big: '2.2B+', small: 'people live with vision impairment or read in a second language.' },
          ].map((s) => (
            <div key={s.big} className="text-center">
              <div className="text-4xl font-extrabold tracking-tight text-teal-800 sm:text-5xl">{s.big}</div>
              <p className="mx-auto mt-2 max-w-[24rem] text-sm leading-relaxed text-teal-900/60">{s.small}</p>
            </div>
          ))}
        </div>
        <p className="pb-6 text-center text-[11px] text-teal-900/40">
          Sources: WHO / International Dyslexia Association population estimates · Barbara Bush Foundation for Family Literacy · WHO World Report on Vision
        </p>
      </section>

      {/* ======================= FEATURES ======================= */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-3xl font-extrabold tracking-tight sm:text-5xl"
          >
            A whole reading environment,
            <br />
            not another chatbot.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            custom={1}
            className="mt-4 text-lg text-teal-900/60"
          >
            Six tools that work together, built around one promise: the text bends to the reader,
            never the other way around.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i % 3}
              className="group rounded-3xl border border-teal-900/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-700/30 hover:shadow-xl hover:shadow-teal-900/5"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700/10 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                <f.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-teal-900/60">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ======================= HOW IT WORKS ======================= */}
      <section id="how" className="border-y border-teal-900/[0.07] bg-teal-950 text-teal-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Hard text to calm reading
              <br />
              in three steps.
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                custom={i}
                className="relative"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-amber-400">{s.n}</span>
                  <span className="h-px flex-1 bg-teal-50/15" aria-hidden />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-teal-50/60">{s.body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Button
              onClick={onStart}
              size="lg"
              className="h-14 rounded-2xl bg-amber-500 px-9 text-base font-bold text-teal-950 shadow-xl shadow-amber-500/20 transition hover:bg-amber-400"
            >
              Open LexiLens Reader
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      {/* ======================= WHO ======================= */}
      <section id="who" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Who is reading
            <span className="text-teal-700"> through LexiLens?</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE.map((a, i) => (
            <motion.div
              key={a.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i % 3}
              className="flex gap-4 rounded-3xl border border-teal-900/10 bg-[#fdfbf5] p-6 transition hover:border-teal-700/25"
            >
              <a.icon className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" aria-hidden />
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-teal-900/60">{a.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================= FINAL CTA ======================= */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="hero-glow relative overflow-hidden rounded-[2.5rem] border border-teal-900/10 bg-white px-6 py-16 text-center sm:px-12 sm:py-20">
          <Highlighter className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            The next hard thing you have to read?
            <br />
            Make it easy.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-teal-900/60">
            Free forever, private by design, and built in a weekend because reading should never
            be the barrier.
          </p>
          <Button
            onClick={onStart}
            size="lg"
            className="mt-8 h-14 rounded-2xl bg-teal-700 px-9 text-base font-semibold text-white shadow-xl shadow-teal-700/25 transition hover:bg-teal-800"
          >
            Start reading free
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Button>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="mt-auto border-t border-teal-900/[0.07] bg-white/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-teal-900/50 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white">
              <BookOpen className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-bold text-teal-900">LexiLens</span>
            <span>— see words differently.</span>
          </div>
          <p className="text-xs">
            Built with ♥ for NextSpark Hacks 2026 · Fonts by OpenDyslexic & Atkinson Hyperlegible · Voice & simplification by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
