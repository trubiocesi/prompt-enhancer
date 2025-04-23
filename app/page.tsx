"use client";
import { useState, useEffect  } from 'react';

export default function Home() {
   const [raw, setRaw] = useState('');
   const [enhanced, setEnhanced] = useState('');
   const [tones, setTones] = useState<string[]>(['cinematic']);
   const [noFluff,  setNoFluff]  = useState(false);

   interface HistoryEntry {
    raw: string;
    enhanced: string;
    timestamp: string;
  }
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // load on mount
  useEffect(() => {
    const stored = localStorage.getItem('promptHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  async function handleEnhance() {
    // clear previous
    setEnhanced('');
    
    // start the stream
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: raw, tones, noFluff }),
    });
    if (!res.ok) throw new Error('Enhance failed');
  
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulated = '';
  
    // read the live response
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        accumulated += decoder.decode(value);
        setEnhanced(accumulated);
      }
    }
  
    // ─── Now record history ───────────────────────────
    const entry = {
      raw,
      enhanced: accumulated,
      timestamp: new Date().toISOString(),
    };
    const newHist = [entry, ...history];
    setHistory(newHist);
    localStorage.setItem('promptHistory', JSON.stringify(newHist));
    // ───────────────────────────────────────────────────
  }  

  return (
    <main className="min-h-screen flex flex-col items-center px-6">
      {/* Hero */}
      <section className="relative w-full pt-28 pb-20 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/30 via-fuchsia-500/10 to-cyan-500/10 blur-3xl" />
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">
          Prompt<span className="text-accent">Forge</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-300">
          Turn rough ideas into laser‑focused AI prompts with a single click.
        </p>

        {/* Prompt card */}
        <div className="mt-10 w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl">
          <label htmlFor="raw" className="block text-left font-medium mb-2">
            ✍️ Your Prompt
          </label>

        {/* ─── Templates Panel ─── */}
        <details className="w-full mb-4 group">
          <summary className="
            flex items-center justify-between cursor-pointer rounded-lg 
            bg-white/10 p-3 hover:bg-white/20 transition
          ">
            <span className="font-medium text-gray-200">Templates</span>
            <svg
              className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          {/* main presets grid */}
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
                className="
                  text-sm text-gray-100 px-2 py-1 rounded-md bg-white/5 
                  hover:bg-accent/20 transition
                "
              >
                {name}
              </button>
            ))}
          </div>

          {/* separator */}
          <div className="mt-4 border-t border-white/20" />

          {/* Noone “clear” button as its own row */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => setRaw('')}
              className="
                text-sm text-red-300 px-4 py-2 rounded-full border border-red-300 
                hover:bg-red-500/20 transition
              "
            >
              Clear
            </button>
          </div>
        </details>

          <textarea
            id="raw"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="e.g.  'draw a fantasy landscape'"
            className="w-full rounded-lg p-4 bg-black/40 border border-white/10"
            rows={3}
          />

          {/* ─── Style Controls ─── */}
          <div className="mt-4 flex flex-wrap gap-4">
      
            {/* Tone */}
              {/* Tone buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  'cinematic',
                  'technical',
                  'poetic',
                  'concise',
                  'dramatic',
                  'detailed',
                  'minimalist',
                  'conversational',
                  'narrative',
                  'descriptive'
                  ].map((t) => {
                        const selected = tones.includes(t);
                        const label = t.charAt(0).toUpperCase() + t.slice(1);
                        return (
                          <button
                            key={t}
                            onClick={() => {
                              if (selected) setTones(tones.filter(x => x !== t));
                              else        setTones([...tones, t]);
                            }}
                            className={`
                              px-3 py-1 rounded-full text-sm font-medium transition
                              ${selected
                                ? 'bg-accent text-black'
                                : 'bg-white/10 text-gray-200 hover:bg-white/20'}
                            `}
                          >
                            {label}
                          </button>
                        );
                      })}
              </div>

            {/* No-Fluff Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 font-medium">No Fluff</span>
                <button
                  onClick={() => setNoFluff(!noFluff)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors 
                    focus:outline-none ${noFluff ? 'bg-accent' : 'bg-white/20'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform
                      ${noFluff ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
          </div>

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
      </section>
      {/* ─── Prompt History ─── */}
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
        <li
          key={timestamp + i}
          className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
        >
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