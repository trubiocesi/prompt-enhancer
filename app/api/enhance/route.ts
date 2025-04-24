import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { prompt, tones, maxTokens, noFluff } = await req.json();

  // Rebuild your system prompt as before...
  const toneLine = Array.isArray(tones)
    ? tones.length > 1
      ? tones.slice(0, -1).join(', ') + ' and ' + tones.slice(-1)
      : tones[0]
    : tones;
  const sys = [
    `You are an expert prompt-engineer in a style mixing ${toneLine}.`,
    'Enhance the user’s prompt by adding specificity, style, and structure.',
    `Ensure the output is no more than ${maxTokens} tokens.`,
    noFluff ? 'Avoid any non-essential adjectives.' : '',
    'Return ONLY the improved prompt text.',
  ]
    .filter(Boolean)
    .join(' ');

  // Kick off a streamed completion
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',   // or 'gpt-4o-mini'
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens + 20,
    stream: true,
  });

  // Build a native ReadableStream from the chunks
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const part of response) {
        const token = part.choices[0].delta?.content;
        if (token) {
          controller.enqueue(encoder.encode(token));
        }
      }
      controller.close();
    }
  });

  // Return it directly—no helper needed
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}