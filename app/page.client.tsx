"use client";

import { useState, useEffect } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryEntry {
  raw: string;
  enhanced: string;
  timestamp: string;
}

export default function HomeClient() {
  const [showMiniTitle, setShowMiniTitle] = useState(false);
  const [raw, setRaw] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number|null>(null);
  const [tones, setTones] = useState<string[]>(["cinematic"]);
  const [noFluff, setNoFluff] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("promptHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowMiniTitle(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //Function copy
  function handleCopy() {
    navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // History copy
  function handleHistoryCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  
  async function handleEnhance() {
    setEnhanced("");
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: raw, tones, noFluff }),
    });
    if (!res.ok) throw new Error("Enhance failed");

    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let done = false,
      acc = "";

    while (!done) {
      const { value, done: dr } = await reader.read();
      done = dr;
      if (value) {
        acc += dec.decode(value);
        setEnhanced(acc);
      }
    }

    const entry = { raw, enhanced: acc, timestamp: new Date().toISOString() };
    const newHist = [entry, ...history];
    setHistory(newHist);
    localStorage.setItem("promptHistory", JSON.stringify(newHist));
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6">
      {showMiniTitle && (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed top-4 left-4 z-50
                  flex items-center justify-center
                  px-4 py-2 rounded-full font-bold text-xl
                  bg-white text-gray-900 border border-gray-300 shadow
                  dark:bg-[#1E1E2A] dark:text-white dark:border-white/20
                  hover:scale-105 hover:shadow-md transition"
        title="Back to top"
      >
        <span className="text-white dark:text-white">P</span>
        <span className="text-accent ml-1">R</span>
      </button>
    )}

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative w-full pt-28 pb-20 flex flex-col items-center text-center">
      <div className="absolute inset-0 -z-10
            bg-gradient-to-br
              from-accent/30 
              via-accent-light/10 
              to-accent-dark/10
            blur-3xl"></div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-extrabold tracking-tight drop-shadow-lg"
        >
          <motion.span
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-block text-white dark:text-white"
          >
            Prompt
          </motion.span>
          <motion.span
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-block text-accent"
          >
            Reforge
          </motion.span>
        </motion.h1>
        {/* Darker tagline text in light mode */}
        <p className="mt-4 max-w-xl text-lg text-light-text dark:text-gray-300">
          Turn rough ideas into laser-focused AI prompts with a single click.
        </p>

        {/* ─── Prompt Card ────────────────────────────────── */}
        <div
          className="mt-10 w-full max-w-3xl rounded-3xl
                     bg-light-card dark:bg-white/10
                     backdrop-blur-md
                     border border-light-border dark:border-white/20
                     p-8 shadow-2xl"
        >
          {/* Templates Panel */}
            <details className="w-full mb-4 group">
            <summary className=" flex items-center justify-between cursor-pointer
                                rounded-lg
                                bg-gray-300 dark:bg-white/10
                                border border-gray-400 dark:border-white/20
                                shadow-sm
                                p-3
                                hover:bg-gray-400 dark:hover:bg-white/20
                                transition">
              <span className="font-medium text-gray-900 dark:text-gray-200"> Templates </span>
              <svg
                className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { name: "Art", tpl: "{subject} {medium} {style} {lighting} {composition}" },
                { name: "Story", tpl: "{protagonist} {goal} {conflict} {setting}" },
                { name: "Code", tpl: "{language} script to {task} using {libraries}" },
                { name: "Blog", tpl: "{topic} blog post with {tone} tone and {keywords}" },
                { name: "Email", tpl: "Write an email to {recipient} about {subject}" },
                { name: "Ad", tpl: "Create a marketing ad for {product} highlighting {benefits}" },
                { name: "Explain", tpl: "Explain {concept} as if teaching a beginner" },
                { name: "Debug", tpl: "Debug the following code snippet: {code}" },
                { name: "Translate", tpl: "Translate this text to {language}" },
                {
                  name: "Analysis", 
                  tpl: "Analyze the following data and summarize insights: {data}",
                },
                { name: "Poetry", tpl: "Write a {form} poem about {theme} with {style}" },
              ].map(({ name, tpl }) => (
                <button
                key={name}
                onClick={() => setRaw(tpl)}
                className={`
                  text-sm font-medium px-2 py-1 rounded-md transition
                  bg-white text-gray-900 border border-gray-700 hover:bg-gray-100
                  dark:bg-white/5 dark:text-gray-100 dark:hover:bg-accent/20 dark:border-none
                  `}
              >
                  {name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-center">
            <button
                onClick={() => setRaw("")}
                className="text-sm text-red-700 dark:text-red-300
                  px-4 py-2 rounded-full
                  border border-red-700 dark:border-red-300
                  hover:bg-red-700/30 dark:hover:bg-red-500/20
                  transition
                "
              >
                Clear
              </button>
            </div>
          </details>

          {/* Input */}
          <textarea
            id="raw"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="e.g. 'draw a fantasy landscape'"
            rows={3}
            className="
              w-full rounded-lg p-4
              bg-white/70 dark:bg-black/40
              border border-light-border dark:border-white/10
            "
          />

          {/* Style Controls */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            {/* Tone buttons with deeper purple in light mode */}
            <div className="flex flex-wrap gap-2">
              {[
                "cinematic",
                "technical",
                "poetic",
                "concise",
                "dramatic",
                "detailed",
                "minimalist",
                "conversational",
                "narrative",
                "descriptive",
              ].map((t) => {
                const selected = tones.includes(t);
                const label = t.charAt(0).toUpperCase() + t.slice(1);
              
                return (
                  <button
                    key={t}
                    onClick={() =>
                      selected
                        ? setTones(tones.filter((x) => x !== t))
                        : setTones([...tones, t])
                    }
                    className={`
                      /* Base styling */
                      px-3 py-1 rounded-full text-sm font-medium transition
              
                      /* Light-mode look */
                      ${
                        selected
                          ? "bg-gray-700 text-white border border-black hover:bg-gray-800"
                          : "bg-gray-100 text-gray-900 border border-black hover:bg-gray-200"
                      }
              
                      /* Dark-mode look */
                      ${
                        selected
                          ? "dark:bg-accent dark:text-white"
                          : "dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      }
              
                      /* Common */
                      dark:border-none
                    `}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* No-Fluff Toggle */}
            <div className="flex items-center gap-3">
            <span className="text-sm text-light-text dark:text-gray-300 font-medium">
              No Fluff
            </span>
            <button
              onClick={() => setNoFluff(!noFluff)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                transition-colors duration-300 ease-in-out focus:outline-none
                ${noFluff
                  ? "bg-gray-700"                /* light-mode ON track */
                  : "bg-white border border-gray-700" /* light-mode OFF track */
                }
                ${noFluff
                  ? "dark:bg-accent"            /* dark-mode ON */
                  : "dark:bg-white/20"          /* dark-mode OFF */
                }
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full
                  ${noFluff
                    ? "bg-white shadow"          /* light-mode ON thumb */
                    : "bg-gray-700 shadow"       /* light-mode OFF thumb */
                  }
                  dark:bg-white dark:shadow     /* dark-mode thumb always white */
                  transition-transform duration-300 ease-in-out
                  ${noFluff ? "translate-x-5" : "translate-x-1"}
                `}
              />
            </button>
          </div>
          </div>

          {/* Enhance */}
          <button
            onClick={handleEnhance}
            className={`
              mt-6 w-full py-3 rounded-xl font-semibold transition
              bg-gray-700 text-white hover:bg-gray-800
              dark:bg-accent dark:text-black dark:hover:bg-accent/80
            `}
            > Enhance </button>

          {/* Preview */}
          {enhanced && (
              <div className="mt-8 w-full max-w-3xl">
                 <div className="relative bg-light-card dark:bg-black/30 p-4 rounded-xl">
          {/* Copy button inside the box */}
              <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded
          bg-gray-700 text-white hover:bg-gray-800
          dark:bg-white/20 dark:text-white dark:hover:bg-white/30
          transition"
                title="Copy to clipboard">
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span className="text-sm">Copied</span>
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-5 w-5" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>

          {/* Push the text down below the button */}
              <div className="pt-8">
                <pre className="whitespace-pre-wrap text-left">
                  {enhanced}
                </pre>
              </div>
             </div>
            </div>
                )}
            </div>
        </section>

      {/* History */}
      <section className="w-full max-w-3xl mt-12">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">History</h2>
          <button
            onClick={() => {
              localStorage.removeItem("promptHistory");
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
                className="
                  p-4 rounded-lg
                  bg-light-card hover:bg-light-card/70
                  dark:bg-white/5 dark:hover:bg-white/10
                  transition
                "
              >
                <div className="text-xs text-gray-400">
                  {new Date(timestamp).toLocaleString()}
                </div>
                <div className="mt-1">
                  <strong className="text-sm">Input:</strong>
                  <p className="pl-2 text-light-text dark:text-gray-200">{raw}</p>
                </div>
                <div className="mt-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm">Enhanced:</strong>
                    <button
                      onClick={() => handleHistoryCopy(enhanced, i)}
                      className="
                        flex items-center p-1 rounded
                        bg-gray-700 text-white hover:bg-gray-800
                        dark:bg-white/20 dark:text-white dark:hover:bg-white/30
                        transition"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === i ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 pl-2 text-light-text dark:text-gray-100">{enhanced}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
