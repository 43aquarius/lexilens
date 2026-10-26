'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Eraser,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Settings2,
  Square,
  Type,
  Volume2,
  Wand2,
  Loader2,
  AlignLeft,
  Highlighter,
  Ruler,
} from 'lucide-react';
import {
  DEFAULT_SETTINGS,
  ReadingLevel,
  SAMPLE_TEXTS,
  ReaderSettings,
} from './types';

interface Word {
  text: string;
  start: number;
  end: number;
  para: number;
}

interface ReaderProps {
  onExit: () => void;
}

const LEVEL_LABEL: Record<ReadingLevel, string> = {
  original: 'Original',
  easy: 'Easy',
  easiest: 'Easiest',
};

export default function Reader({ onExit }: ReaderProps) {
  const { toast } = useToast();

  // ---- text state ----
  const [sourceText, setSourceText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [level, setLevel] = useState<ReadingLevel>('original');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [stage, setStage] = useState<'input' | 'canvas'>('input');
  const cache = useRef<Partial<Record<ReadingLevel, string>>>({});
  const lastSimplifiedSource = useRef<string>('');

  // ---- settings ----
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lexilens-settings');
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);
  const updateSetting = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      try {
        localStorage.setItem('lexilens-settings', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // ---- read aloud ----
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'ai' | 'browser'>('ai');
  const [speed, setSpeed] = useState(1);
  const [highlightWord, setHighlightWord] = useState(-1);
  const [activePara, setActivePara] = useState(-1);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // ---- ruler ----
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rulerY, setRulerY] = useState<number | null>(null);

  // ---- derived ----
  const paragraphs = useMemo(
    () => displayText.split(/\n{2,}|\n/).filter((p) => p.trim().length > 0),
    [displayText]
  );

  const words = useMemo<Word[]>(() => {
    const out: Word[] = [];
    paragraphs.forEach((para, pi) => {
      const re = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(para)) !== null) {
        out.push({ text: m[0], start: m.index, end: m.index + m[0].length, para: pi });
      }
    });
    return out;
  }, [paragraphs]);

  const wordCount = words.length;
  const readMinutes = Math.max(1, Math.round(wordCount / 180));

  // ---- simplify ----
  const simplify = useCallback(
    async (target: ReadingLevel) => {
      if (target === 'original') {
        setDisplayText(sourceText);
        setLevel('original');
        return;
      }
      if (!sourceText.trim()) return;
      if (
        cache.current[target] &&
        lastSimplifiedSource.current === sourceText
      ) {
        setDisplayText(cache.current[target]!);
        setLevel(target);
        return;
      }
      setLevel(target);
      setIsSimplifying(true);
      setDisplayText('');
      try {
        const res = await fetch('/api/simplify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, level: target }),
        });
        if (!res.ok || !res.body) throw new Error(`Server responded ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setDisplayText(acc);
        }
        cache.current[target] = acc;
        cache.current['original'] = sourceText;
        lastSimplifiedSource.current = sourceText;
      } catch (e) {
        toast({
          title: 'Simplification failed',
          description: e instanceof Error ? e.message : 'Please try again.',
          variant: 'destructive',
        });
        setDisplayText(sourceText);
        setLevel('original');
      } finally {
        setIsSimplifying(false);
      }
    },
    [sourceText, toast]
  );

  const startReading = useCallback(() => {
    const text = displayText.trim();
    if (!text) {
      toast({ title: 'Add some text first', description: 'Paste text or load a sample.' });
      return;
    }
    setStage('canvas');
  }, [displayText, toast]);

  // ---- stop helpers ----
  const chunkQueue = useRef<{ text: string; firstWord: number; lastWord: number }[]>([]);
  const chunkIdx = useRef(0);
  const abortVoice = useRef(false);

  const stopAudio = useCallback(() => {
    abortVoice.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src.startsWith('blob:')) URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setHighlightWord(-1);
    setActivePara(-1);
  }, []);

  useEffect(() => stopAudio, [stopAudio]);

  // ---- browser voice fallback ----
  const playBrowserVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({ title: 'Speech is not supported in this browser.' });
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(displayText.slice(0, 3500));
    utter.rate = speed;
    let wordIdx = 0;
    utter.onboundary = (ev) => {
      if (ev.name !== 'word' && ev.charIndex !== undefined) return;
      // find the word containing charIndex
      const target = ev.charIndex ?? 0;
      while (wordIdx < words.length - 1 && words[wordIdx].start < target) wordIdx++;
      while (wordIdx > 0 && words[wordIdx].start > target) wordIdx--;
      setHighlightWord(wordIdx);
      if (words[wordIdx]) setActivePara(words[wordIdx].para);
    };
    utter.onend = () => stopAudio();
    utter.onerror = () => stopAudio();
    synth.speak(utter);
    setIsPlaying(true);
    setIsPaused(false);
  }, [displayText, speed, words, stopAudio, toast]);

  // ---- AI voice with chunked streaming + time-based karaoke highlighting ----
  const buildChunks = useCallback(() => {
    // split paragraphs into chunks of <= 600 chars; remember word index range
    const chunks: { text: string; firstWord: number; lastWord: number }[] = [];
    let cur = '';
    let first = 0;
    let wi = 0;
    paragraphs.forEach((p) => {
      const pWords = p.match(/\S+/g)?.length ?? 0;
      if (cur && (cur + '\n\n' + p).length > 600) {
        chunks.push({ text: cur, firstWord: first, lastWord: wi - 1 });
        cur = p;
        first = wi;
      } else {
        cur = cur ? cur + '\n\n' + p : p;
      }
      wi += pWords;
    });
    if (cur.trim()) chunks.push({ text: cur, firstWord: first, lastWord: wi - 1 });
    return chunks;
  }, [paragraphs]);

  const playAIVoice = useCallback(async () => {
    const chunks = buildChunks();
    if (!chunks.length) return;
    chunkQueue.current = chunks;
    chunkIdx.current = 0;
    abortVoice.current = false;
    setAudioLoading(true);

    const fetchChunkAudio = async (c: { text: string }) => {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: c.text.slice(0, 1200), speed }),
      });
      if (!res.ok) throw new Error('Voice generation failed');
      return res.blob();
    };

    const playChunk = async (ci: number, blob: Blob) => {
      const c = chunkQueue.current[ci];
      const nextBlobPromise =
        ci + 1 < chunkQueue.current.length ? fetchChunkAudio(chunkQueue.current[ci + 1]) : null;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      const chunkWords = words.slice(c.firstWord, c.lastWord + 1);
      const totalChars = chunkWords.reduce((a, w) => a + w.text.length + 1, 0) || 1;
      const charAt = new Float32Array(chunkWords.length);
      let acc = 0;
      chunkWords.forEach((w, i) => {
        charAt[i] = (acc + w.text.length / 2) / totalChars;
        acc += w.text.length + 1;
      });
      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
      setAudioLoading(false);
      await new Promise<void>((resolve) => {
        const done = () => {
          audio.onended = null;
          audio.onerror = null;
          resolve();
        };
        audio.onended = done;
        audio.onerror = done;
        const tick = () => {
          if (abortVoice.current || audioRef.current !== audio) {
            done();
            return;
          }
          if (!audio.paused && audio.duration) {
            const p = audio.currentTime / audio.duration;
            let idx = charAt.findIndex((cv) => cv >= p);
            if (idx === -1) idx = chunkWords.length - 1;
            setHighlightWord(c.firstWord + idx);
            if (chunkWords[idx]) setActivePara(chunkWords[idx].para);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      });
      URL.revokeObjectURL(url);
      const nextBlob = nextBlobPromise ? await nextBlobPromise : null;
      if (abortVoice.current || !nextBlob) return;
      if (chunkIdx.current !== ci) return;
      chunkIdx.current = ci + 1;
      await playChunk(ci + 1, nextBlob);
    };

    try {
      await playChunk(0, await fetchChunkAudio(chunks[0]));
      if (!abortVoice.current) stopAudio();
    } catch {
      setAudioLoading(false);
      toast({
        title: 'AI voice unavailable',
        description: 'Falling back to your browser voice.',
      });
      setVoiceMode('browser');
      playBrowserVoice();
    }
  }, [buildChunks, speed, words, stopAudio, toast, playBrowserVoice]);

  const togglePlay = useCallback(() => {
    if (isPlaying && !isPaused) {
      // pause
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPaused(true);
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else if (isPlaying && isPaused) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPaused(false);
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } else {
      if (voiceMode === 'ai') playAIVoice();
      else playBrowserVoice();
    }
  }, [isPlaying, isPaused, voiceMode, playAIVoice, playBrowserVoice]);

  // ---- word double-click: say just that word ----
  const handleWordDblClick = useCallback((word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  // ---- render helpers ----
  const renderParagraph = (para: string, pi: number) => {
    const paraWords: Array<{ w: Word; localStart: number }> = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(para)) !== null) {
      const global = words.find(
        (w) => w.para === pi && w.start === m!.index
      );
      if (global) paraWords.push({ w: global, localStart: m.index });
    }
    let cursor = 0;
    const nodes: React.ReactNode[] = [];
    paraWords.forEach(({ w, localStart }, wi) => {
      if (localStart > cursor) {
        nodes.push(para.slice(cursor, localStart));
      }
      const isCurrent = words[highlightWord] === w;
      nodes.push(
        <span
          key={wi}
          className={isCurrent ? 'word-highlight' : undefined}
          onDoubleClick={() => handleWordDblClick(w.text)}
          role="button"
          tabIndex={-1}
          aria-hidden={false}
        >
          {w.text}
        </span>
      );
      cursor = localStart + w.text.length;
    });
    if (cursor < para.length) nodes.push(para.slice(cursor));
    return (
      <p
        key={pi}
        className={`reader-para ${activePara === pi ? 'is-active' : ''}`}
        style={{ marginBottom: `${settings.paraSpacing}em` }}
      >
        {nodes}
      </p>
    );
  };

  const fontClass =
    settings.font === 'dyslexic'
      ? 'font-dyslexic'
      : settings.font === 'atkinson'
        ? 'font-atkinson'
        : '';

  const canvasStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    letterSpacing: `${settings.letterSpacing}em`,
    wordSpacing: `${settings.wordSpacing}em`,
  };

  // ================= INPUT STAGE =================
  if (stage === 'input') {
    return (
      <div className="min-h-screen bg-[#faf7f0]">
        <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-[#faf7f0]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <button
              onClick={onExit}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-900/70 transition hover:bg-teal-900/5 hover:text-teal-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <div className="flex items-center gap-2 text-teal-800">
              <BookOpen className="h-5 w-5" aria-hidden />
              <span className="font-semibold">LexiLens Reader</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">
            Paste text that is hard to read
          </h1>
          <p className="mt-3 text-base text-teal-900/60">
            Medicine labels, lease agreements, terms of service, research
            papers — anything dense. LexiLens will simplify it and adapt the
            page to your eyes.
          </p>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Sample texts">
            {SAMPLE_TEXTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSourceText(s.text);
                  setDisplayText(s.text);
                  setLevel('original');
                  cache.current = {};
                }}
                className="rounded-full border border-teal-800/20 bg-white px-4 py-1.5 text-sm font-medium text-teal-800 shadow-sm transition hover:border-teal-700 hover:bg-teal-50"
              >
                {s.label}
              </button>
            ))}
            {sourceText && (
              <button
                onClick={() => {
                  setSourceText('');
                  setDisplayText('');
                }}
                className="rounded-full border border-transparent px-3 py-1.5 text-sm text-teal-900/50 transition hover:text-teal-900"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-4">
            <Textarea
              value={sourceText}
              onChange={(e) => {
                setSourceText(e.target.value);
                setDisplayText(e.target.value);
              }}
              placeholder="Paste or type your text here…"
              aria-label="Text to read"
              className="min-h-[240px] resize-y rounded-2xl border-2 border-teal-900/15 bg-white p-5 text-base leading-relaxed text-teal-950 shadow-sm placeholder:text-teal-900/35 focus-visible:border-teal-700 focus-visible:ring-teal-700/30"
            />
            <div className="mt-2 flex items-center justify-between text-sm text-teal-900/50">
              <span>
                {wordCount.toLocaleString()} words · about {readMinutes} min
                read
              </span>
              <span>Double-click any word later to hear it alone.</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={startReading}
              disabled={!sourceText.trim()}
              className="h-14 flex-1 rounded-2xl bg-teal-700 text-base font-semibold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 disabled:opacity-40"
            >
              <BookOpen className="mr-2 h-5 w-5" aria-hidden />
              Open in Reader
            </Button>
          </div>

          <section aria-label="Privacy note" className="mt-10 rounded-2xl border border-teal-900/10 bg-white p-5 text-sm text-teal-900/70">
            <p>
              <strong className="font-semibold text-teal-900">Private by design.</strong>{' '}
              Your text is only used to simplify or read it aloud. Nothing is
              stored — no account, no tracking.
            </p>
          </section>
        </main>
      </div>
    );
  }

  // ================= CANVAS STAGE =================
  return (
    <div className="flex h-screen flex-col bg-[#faf7f0]">
      {/* Toolbar */}
      <header
        className="z-40 shrink-0 border-b border-teal-900/10 bg-[#faf7f0]/95 backdrop-blur"
        role="toolbar"
        aria-label="Reader controls"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <button
            onClick={() => setStage('input')}
            className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-teal-900/70 transition hover:bg-teal-900/5 hover:text-teal-900"
            aria-label="Edit text"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <div
            className="flex items-center rounded-xl bg-teal-900/[0.06] p-1"
            role="group"
            aria-label="Reading level"
          >
            {(['original', 'easy', 'easiest'] as ReadingLevel[]).map((l) => (
              <button
                key={l}
                onClick={() => simplify(l)}
                disabled={isSimplifying && level !== l}
                className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                  level === l
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-teal-900/55 hover:text-teal-900'
                }`}
                aria-pressed={level === l}
              >
                {l !== 'original' && <Wand2 className="h-3.5 w-3.5" aria-hidden />}
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* Voice mode */}
            <Select
              value={voiceMode}
              onValueChange={(v) => {
                stopAudio();
                setVoiceMode(v as 'ai' | 'browser');
              }}
            >
              <SelectTrigger
                className="h-9 w-[92px] rounded-xl border-teal-900/15 text-xs font-medium text-teal-900 sm:w-[120px] sm:text-sm"
                aria-label="Voice type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">AI voice</SelectItem>
                <SelectItem value="browser">Browser voice</SelectItem>
              </SelectContent>
            </Select>

            {/* speed */}
            <Select
              value={String(speed)}
              onValueChange={(v) => {
                stopAudio();
                setSpeed(Number(v));
              }}
            >
              <SelectTrigger
                className="h-9 w-[70px] rounded-xl border-teal-900/15 text-xs font-medium text-teal-900 sm:w-[84px] sm:text-sm"
                aria-label="Reading speed"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0.75, 1, 1.25, 1.5].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={togglePlay}
              disabled={audioLoading}
              className="h-9 rounded-xl bg-teal-700 px-4 font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800"
              aria-label={isPlaying && !isPaused ? 'Pause reading' : 'Start reading'}
            >
              {audioLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : isPlaying && !isPaused ? (
                <Pause className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4" aria-hidden />
              )}
              <span className="ml-1 hidden sm:inline">
                {audioLoading ? 'Loading' : isPlaying && !isPaused ? 'Pause' : 'Listen'}
              </span>
            </Button>
            {isPlaying && (
              <Button
                size="sm"
                variant="ghost"
                onClick={stopAudio}
                className="h-9 rounded-xl px-2.5 text-teal-900/70 hover:bg-teal-900/5 hover:text-teal-900"
                aria-label="Stop reading"
              >
                <Square className="h-4 w-4" aria-hidden />
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-xl border-teal-900/15 px-3 text-teal-900 hover:bg-teal-50"
                  aria-label="Display settings"
                >
                  <Settings2 className="h-4 w-4" aria-hidden />
                  <span className="ml-1 hidden md:inline">Display</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[320px] overflow-y-auto bg-[#faf7f0] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="text-teal-950">Make it yours</SheetTitle>
                  <SheetDescription className="text-teal-900/60">
                    Dyslexia-friendly typography. Saved automatically on this
                    device.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2 space-y-6 px-4 pb-8">
                  <section aria-label="Font">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-900">
                      <Type className="h-4 w-4" aria-hidden /> Font
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'sans', label: 'Standard', cls: '' },
                          { id: 'atkinson', label: 'Hyperlegible', cls: 'font-atkinson' },
                          { id: 'dyslexic', label: 'OpenDyslexic', cls: 'font-dyslexic' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateSetting('font', f.id)}
                          className={`rounded-xl border-2 p-3 text-center text-xs font-semibold transition ${f.cls} ${
                            settings.font === f.id
                              ? 'border-teal-700 bg-teal-50 text-teal-800'
                              : 'border-teal-900/10 bg-white text-teal-900/60 hover:border-teal-700/40'
                          }`}
                          aria-pressed={settings.font === f.id}
                        >
                          Aa
                          <span className="mt-1 block text-[10px] font-medium">
                            {f.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section aria-label="Theme">
                    <h4 className="mb-2 text-sm font-semibold text-teal-900">
                      Calm themes
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {(
                        [
                          { id: 'paper', bg: '#ffffff', ring: '#e5e5e5' },
                          { id: 'cream', bg: '#faf3e3', ring: '#e8d9bd' },
                          { id: 'mint', bg: '#e8f3ee', ring: '#c8e0d5' },
                          { id: 'night', bg: '#1c2321', ring: '#3a4a45' },
                          { id: 'contrast', bg: '#000000', ring: '#555555' },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => updateSetting('theme', t.id)}
                          className={`h-10 rounded-xl border-2 transition ${
                            settings.theme === t.id
                              ? 'border-teal-700 ring-2 ring-teal-700/30'
                              : 'border-teal-900/10 hover:border-teal-700/40'
                          }`}
                          style={{ background: t.bg, boxShadow: `inset 0 0 0 1px ${t.ring}` }}
                          aria-label={`${t.id} theme`}
                          aria-pressed={settings.theme === t.id}
                        />
                      ))}
                    </div>
                  </section>

                  {(
                    [
                      { key: 'fontSize' as const, label: 'Text size', min: 16, max: 34, step: 1, unit: 'px', def: 22 },
                      { key: 'lineHeight' as const, label: 'Line spacing', min: 1.3, max: 2.6, step: 0.1, unit: '', def: 1.9 },
                      { key: 'letterSpacing' as const, label: 'Letter spacing', min: 0, max: 0.14, step: 0.01, unit: 'em', def: 0.04 },
                      { key: 'wordSpacing' as const, label: 'Word spacing', min: 0, max: 0.45, step: 0.01, unit: 'em', def: 0.12 },
                      { key: 'paraSpacing' as const, label: 'Paragraph gaps', min: 0.6, max: 2.4, step: 0.1, unit: 'em', def: 1.2 },
                    ]
                  ).map((c) => (
                    <section key={c.key} aria-label={c.label}>
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-teal-900">{c.label}</h4>
                        <span className="text-xs tabular-nums text-teal-900/50">
                          {settings[c.key]}{c.unit}
                        </span>
                      </div>
                      <Slider
                        value={[settings[c.key] as number]}
                        min={c.min}
                        max={c.max}
                        step={c.step}
                        onValueChange={([v]) => updateSetting(c.key, v)}
                        aria-label={c.label}
                      />
                    </section>
                  ))}

                  <Separator className="bg-teal-900/10" />

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                          <Highlighter className="h-4 w-4" aria-hidden /> Focus mode
                        </div>
                        <p className="mt-0.5 text-xs text-teal-900/50">
                          Dim everything except the line you are on.
                        </p>
                      </div>
                      <Switch
                        checked={settings.focusMode}
                        onCheckedChange={(v) => updateSetting('focusMode', v)}
                        aria-label="Focus mode"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                          <Ruler className="h-4 w-4" aria-hidden /> Reading ruler
                        </div>
                        <p className="mt-0.5 text-xs text-teal-900/50">
                          A colored band that follows your cursor.
                        </p>
                      </div>
                      <Switch
                        checked={settings.ruler}
                        onCheckedChange={(v) => updateSetting('ruler', v)}
                        aria-label="Reading ruler"
                      />
                    </div>
                  </section>

                  <Button
                    variant="ghost"
                    className="w-full rounded-xl text-teal-900/60 hover:bg-teal-900/5"
                    onClick={() => {
                      setSettings(DEFAULT_SETTINGS);
                      try {
                        localStorage.setItem(
                          'lexilens-settings',
                          JSON.stringify(DEFAULT_SETTINGS)
                        );
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                    Reset to defaults
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Simplifying banner */}
      {isSimplifying && (
        <div
          role="status"
          className="shrink-0 bg-amber-100/80 px-4 py-1.5 text-center text-xs font-semibold text-amber-800"
        >
          <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" aria-hidden />
          LexiLens is rewriting this at the “{LEVEL_LABEL[level]}” level…
        </div>
      )}

      {/* Reading canvas */}
      <main
        className={`reader-theme-${settings.theme} relative min-h-0 flex-1 ${settings.focusMode ? 'focus-mode' : ''}`}
      >
        <div
          ref={canvasRef}
          className={`reader-scroll reader-canvas relative h-full overflow-y-auto ${fontClass}`}
          onMouseMove={(e) => {
            if (!settings.ruler || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            setRulerY(e.clientY - rect.top + canvasRef.current.scrollTop);
          }}
          onMouseLeave={() => setRulerY(null)}
        >
          {settings.ruler && rulerY !== null && (
            <div
              className="reader-ruler"
              style={{ top: `${rulerY - 26}px`, height: '52px' }}
              aria-hidden
            />
          )}
          <div
            className="mx-auto max-w-[44rem] px-6 py-10 sm:px-10 sm:py-14"
            style={canvasStyle}
          >
            <div
              className="mb-8 flex items-center justify-between text-xs"
              style={{ color: 'var(--reader-muted)' }}
            >
              <span className="flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5" aria-hidden />
                {wordCount.toLocaleString()} words · {readMinutes} min ·{' '}
                {LEVEL_LABEL[level]} level
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(displayText);
                  toast({ title: 'Copied to clipboard' });
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 transition hover:opacity-70"
                style={{ color: 'var(--reader-muted)' }}
              >
                <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
              </button>
            </div>
            <article aria-label="Reading text" role="article">
              {paragraphs.map((p, i) => renderParagraph(p, i))}
              {isSimplifying && (
                <span
                  className="inline-block h-6 w-2 animate-pulse align-middle"
                  style={{ background: 'var(--reader-muted)' }}
                  aria-hidden
                />
              )}
            </article>
            {displayText.trim() && !isSimplifying && (
              <div className="mt-10 flex flex-wrap gap-2">
                <Button
                  onClick={() => simplify(level === 'original' ? 'easy' : level)}
                  disabled={level !== 'original' && isSimplifying}
                  className="rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                >
                  <Wand2 className="mr-2 h-4 w-4" aria-hidden />
                  {level === 'original' ? 'Simplify this text' : 'Re-run'}
                </Button>
                {level !== 'original' && (
                  <Button
                    variant="outline"
                    onClick={() => simplify('original')}
                    className="rounded-xl border-teal-900/20 bg-transparent text-teal-900 hover:bg-teal-900/5"
                  >
                    <Eraser className="mr-2 h-4 w-4" aria-hidden />
                    Show original
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom status bar */}
      <footer className="z-30 shrink-0 border-t border-teal-900/10 bg-[#faf7f0]">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-teal-900/45 sm:px-6">
          <span className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
            {isPlaying
              ? isPaused
                ? 'Paused — press play to continue'
                : 'Reading aloud — words glow as they are spoken'
              : 'Press Listen for read-aloud with word highlighting'}
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Check className="h-3.5 w-3.5" aria-hidden />
            Settings saved on this device
          </span>
        </div>
      </footer>
    </div>
  );
}
