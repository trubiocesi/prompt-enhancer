// app/page.client.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

interface HistoryEntry {
  raw: string;
  enhanced: string;
  timestamp: string;
}

export default function HomeClient() {
  // — UI state
  const [raw, setRaw]               = useState('');
  const [enhanced, setEnhanced]     = useState('');
  const [maxTokens, setMaxTokens]   = useState(80);
  const [tones, setTones]           = useState<string[]>(['cinematic']);
  const [noFluff, setNoFluff]       = useState(false);
  const [history, setHistory]       = useState<HistoryEntry[]>([]);

  // — Load history from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem('promptHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // — Guard client-side (in case cookie expires)
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Redirect to login preserving current path
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    });
  }, []);

  // — Handle the Enhance button (stream + record history)
  async function handleEnhance() {
    setEnhanced('');
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: raw, tones, maxTokens, noFluff }),
    });
    if (!res.ok) throw new Error('Enhance failed');

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let acc = '';

    while (!done) {
      const { value, done: dr } = await reader.read();
      done = dr;
      if (value) {
        acc += decoder.decode(value);
        setEnhanced(acc);
      }
    }

    // Record in history
    const entry: HistoryEntry = {
      raw,
      enhanced: acc,
      timestamp: new Date().toISOString(),
    };
    const newHist = [entry, ...history];
    setHistory(newHist);
    localStorage.setItem('promptHistory', JSON.stringify(newHist));
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      {/* Templates Panel */}
      <details className="w-full max-w-3xl mb-4 group">
        <summary className="flex justify-between cursor-pointer rounded-lg bg-white/10 p-3 hover:bg-white/20 transition">
          <span className="font-medium text-gray-200">Templates</span>
          <svg
            className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { name: 'Art',       tpl: '{subject} {medium} {style} {lighting} {composition}' },
            { name: 'Story',     tpl: '{protagonist} {goal} {conflict} {setting}'         },
            { name: 'Code',      tpl: '{language} script to {task} using {libraries}'     },
            { name: 'Blog',      tpl: '{topic} blog post with {tone} tone and {keywords}' },
            { name: 'Email',     tpl: 'Write an email to {recipient} about {subject}'     },
            { name: 'Ad',        tpl: 'Create a marketing ad for {product} highlighting {benefits}' },
            { name: 'Explain',   tpl: 'Explain {concept} as if teaching a beginner'       },
            { name: 'Debug',     tpl: 'Debug the following code snippet: {code}'         },
            { name: 'Translate', tpl: 'Translate this text to {language}'               },
            { name: 'Analysis',  tpl: 'Analyze the following data and summarize insights: {data}' },
            { name: 'Poetry',    tpl: 'Write a {form} poem about {theme} with {style}'    },
          ].map(({ name, tpl }) => (
            <button
              key={name}
              onClick={() => setRaw(tpl)}
              className="text-sm text-gray-100 px-2 py-1 rounded-md bg-white/5 hover:bg-accent/20 transition"
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-white/20" />
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setRaw('')}
            className="text-sm text-red-300 px-4 py-2 rounded-full border border-red-300 hover:bg-red-500/20 transition"
          >
            Noone (Clear)
          </button>
        </div>
      </details>

      {/* Prompt Card */}
      <div className="w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl">
        {/* Selected Tones Pills */}
        <div className="flex gap-1 mb-2 flex-wrap">
          {tones.map(t => (
            <span
              key={t}
              className="text-xs bg-accent/20 px-2 py-0.5 rounded"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </span>
          ))}
        </div>

        {/* Tone Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            'cinematic','technical','poetic','concise','dramatic',
            'detailed','minimalist','conversational','narrative','descriptive'
          ].map(t => {
            const label = t.charAt(0).toUpperCase() + t.slice(1);
            const selected = tones.includes(t);
            return (
              <button
                key={t}
                onClick={() => {
                  if (selected) setTones(tones.filter(x => x !== t));
                  else        setTones([...tones, t]);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selected ? 'bg-accent text-black' : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Style Controls: Max Length & No-Fluff */}
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex flex-col text-sm">
            Max Length ({maxTokens} tokens)
            <input
              type="range"
              min={20}
              max={150}
              value={maxTokens}
              onChange={e => setMaxTokens(+e.target.value)}
              className="mt-1"
            />
          </label>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 font-medium">No Fluff</span>
            <button
              onClick={() => setNoFluff(!noFluff)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none ${
                noFluff ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  noFluff ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Raw Prompt */}
        <label htmlFor="raw" className="block text-left font-medium mt-6 mb-2">
          ✍️ Your Prompt
        </label>
        <textarea
          id="raw"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="e.g. 'draw a fantasy landscape'"
          className="w-full rounded-lg p-4 bg-black/40 border border-white/10"
          rows={3}
        />

        {/* Enhance Button & Result */}
        <button
          onClick={handleEnhance}
          className="mt-6 w-full py-3 rounded-xl bg-accent hover:bg-accent/80 font-semibold transition"
        >
          Enhance ✨
        </button>
        {enhanced && (
          <pre className="mt-8 whitespace-pre-wrap text-left bg-black/30 p-4 rounded-xl">
            {enhanced}
          </pre>
        )}
      </div>

      {/* Prompt History */}
      <section className="w-full max-w-3xl mt-12">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">History</h2>
          <button
            onClick={() => {
              localStorage.removeItem('promptHistory');
              setHistory([]);
            }}  
            className="text-sm text-red-400 hover:underline"
          >
            Clear All
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No history yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map(({ raw, enhanced, timestamp }, i) => (
              <li key={timestamp + i} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <div className="text-xs text-gray-400">
                  {new Date(timestamp).toLocaleString()}
                </div>
                <div className="mt-1">
                  <strong className="text-sm">Input:</strong>
                  <p className="pl-2 text-gray-200">{raw}</p>
                </div>
                <div className="mt-1">
                  <strong className="text-sm">Enhanced:</strong>
                  <p className="pl-2 text-gray-100">{enhanced}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}