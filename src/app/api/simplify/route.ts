import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const LEVEL_PROMPTS: Record<string, string> = {
  easy: `You are LexiLens, an expert reading-accessibility editor. Rewrite the user's text at a "Plain English / Grade 5-6" reading level for people with dyslexia or reading difficulties.

STRICT RULES:
1. Keep the same language as the input text (if input is English, output English; if Chinese, output Chinese).
2. Keep ALL key facts, numbers, names, and dates. Never invent or drop information.
3. Use short sentences (under 15 words each). One idea per sentence.
4. Use common, everyday words. Replace jargon and long words when possible.
5. Keep the paragraph structure and order of ideas. Break the output into short paragraphs of 1-3 sentences each, separated by blank lines.
6. Do NOT add introductions, commentary, or explanations of what you did.
7. Output ONLY the rewritten text, nothing else.`,
  easiest: `You are LexiLens, an expert reading-accessibility editor. Rewrite the user's text at an "Extremely simple / Grade 2-3" reading level for people with severe reading difficulties or cognitive load.

STRICT RULES:
1. Keep the same language as the input text (if input is English, output English; if Chinese, output Chinese).
2. Keep the essential facts, numbers, names, and dates. You may drop minor details, but NEVER invent anything.
3. Use very short sentences (under 10 words). Subject-verb-object structure.
4. Use only the most common everyday words.
5. Keep paragraph breaks short — one small idea per paragraph, separated by blank lines. Never output one long wall of text.
6. Do NOT add introductions, commentary, or explanations.
7. Output ONLY the rewritten text, nothing else.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, level = 'easy' } = body as { text?: string; level?: string };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const trimmed = text.trim().slice(0, 8000);
    const systemPrompt = LEVEL_PROMPTS[level] || LEVEL_PROMPTS.easy;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: trimmed },
      ],
      thinking: { type: 'disabled' },
      stream: true,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        let sseBuffer = '';
        const emitDelta = (raw: string) => {
          for (const line of raw.split('\n')) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data:')) continue;
            const payload = trimmedLine.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // partial or non-JSON line — ignore
            }
          }
        };
        try {
          for await (const chunk of completion as AsyncIterable<unknown>) {
            const text =
              typeof chunk === 'string'
                ? chunk
                : decoder.decode(chunk as Uint8Array, { stream: true });
            sseBuffer += text;
            const parts = sseBuffer.split('\n\n');
            sseBuffer = parts.pop() ?? '';
            for (const part of parts) emitDelta(part);
          }
          if (sseBuffer) emitDelta(sseBuffer);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Stream error';
          controller.enqueue(encoder.encode(`\n\n[LexiLens error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
