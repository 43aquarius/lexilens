import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, speed = 1.0 } = body as { text?: string; speed?: number };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const trimmed = text.trim().slice(0, 4000);
    const clampedSpeed = Math.min(2.0, Math.max(0.5, speed || 1.0));

    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      input: trimmed,
      voice: 'tongtong',
      speed: clampedSpeed,
      response_format: 'wav',
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
