"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";

// Icons  →  npm install lucide-react
import { User as UserIcon, LogOut, Settings, Sun, Moon } from "lucide-react";

export default function AuthBar() {
  /* ───── State ─────────────────────────────────────── */
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : localStorage.getItem("theme") !== "light"
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* ───── Supabase auth listener ────────────────────── */
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_evt, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) router.push("/login");
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [router]);

  /* ───── Theme sync (html.dark + localStorage) ─────── */
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  /* ───── Close menu on outside click / Esc ─────────── */
  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key === "Escape") setOpen(false);
      if (
        e instanceof MouseEvent &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  /* ───── Handlers ──────────────────────────────────── */
  const handleSignOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
    // auth listener will redirect
  }, []);

  if (!user) return null;

  /* ───── UI ────────────────────────────────────────── */
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-auto">
      {/* Profile icon button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          h-8 w-8 flex items-center justify-center rounded-full
          bg-gray-200 dark:bg-white/10
          text-gray-800 dark:text-gray-200
          hover:bg-gray-300 dark:hover:bg-white/20
          focus:outline-none focus:ring-2 focus:ring-accent
        "
      >


        {user.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          className="
            absolute mt-2 right-0 w-48 rounded-md
            bg-light-card dark:bg-white/10
            backdrop-blur-md
            border border-gray-300 dark:border-white/20
            shadow-lg py-1"
        >

          {/* Username header */}
          <div className="px-3 py-2 text-sm text-light-text dark:text-gray-200 border-b border-gray-300 dark:border-white/20">
            {(user.email ?? "User").split("@")[0]}
          </div>

          {/* Account Settings */}
          <button
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            className="
            w-full flex items-center px-3 py-2 text-sm
            text-light-text dark:text-gray-200
            hover:bg-light-card/70 dark:hover:bg-white/20
            focus:outline-none"
            >
            <Settings className="h-4 w-4 mr-2" />
            Account&nbsp;Settings
          </button>
          {/* Theme toggle */}
          <div
            className="
              w-full px-3 py-2 text-sm flex items-center justify-between
              text-light-text dark:text-gray-200
              hover:bg-light-card dark:hover:bg-white/20
              transition
            "
          >
            <span>Theme</span>
            <button
              onClick={() => setDark(!dark)}
              className="
                h-7 w-7 flex items-center justify-center rounded-full
                bg-gray-300 dark:bg-white/10
                text-light-text dark:text-gray-200
                hover:bg-gray-400 dark:hover:bg-white/20
                transition duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-accent
              "
            >
              {dark ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="
            w-full flex items-center px-3 py-2 text-sm
            text-red-600 dark:text-red-400
            hover:bg-red-500/10 dark:hover:bg-red-500/20
            focus:outline-none"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign&nbsp;Out
          </button>
        </div>
      )}
    </div>
  );
}