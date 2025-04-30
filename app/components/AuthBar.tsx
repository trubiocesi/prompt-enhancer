"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";
import {
  User as UserIcon,
  LogOut,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

export default function AuthBar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : localStorage.getItem("theme") !== "light"
  );
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange(
      (_e, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) router.push("/login");
      }
    );
    return () => sub.subscription.unsubscribe();
  }, [router]);

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

  const handleSignOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, []);

  if (!user) return null;

  const tier =
    (user.user_metadata.subscription_tier as "free" | "premium") || "free";
  const creditsRem = user.user_metadata.credits_remaining ?? 0;
  const creditsMax = user.user_metadata.credits_limit ?? 0;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 pointer-events-auto">
      {/* Tier badge */}
      <span
        className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${tier === "premium"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"}
        `}
      >
        {tier === "premium"
          ? "Premium • ∞"
          : `Free • ${creditsRem}/${creditsMax}`}
      </span>

      {/* Avatar + dropdown wrapper */}
      <div className="relative">
        <button
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

        {open && (
          <div
            ref={menuRef}
            className="
              absolute top-full mt-2 right-0 w-52 rounded-md
              bg-white dark:bg-white/10
              border border-gray-300 dark:border-white/20
              shadow-lg py-1
            "
          >
            {/* Username header */}
            <div className="px-3 py-2 text-sm text-gray-900 dark:text-gray-200 border-b border-gray-300 dark:border-white/20">
              {(user.email ?? "User").split("@")[0]}
            </div>

            {/* Redesigned Tier line */}
            <div className="px-3 py-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tier:
              </span>
              <span
                className={`
                  text-sm font-medium px-2 py-1 rounded-full
                  ${tier === "premium"
                    ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}
                `}
              >
                {tier === "premium"
                  ? "Premium (Unlimited)"
                  : `Free (${creditsRem}/${creditsMax} left)`}
              </span>
            </div>

            {/* Theme toggle */}
            <div className="w-full px-3 py-2 flex items-center justify-between text-light-text dark:text-gray-200 hover:bg-light-card dark:hover:bg-white/20">
              <span>Theme</span>
              <button
                onClick={() => setDark(!dark)}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-300 dark:bg-white/10 text-light-text dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>

            {/* Account Settings */}
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/20"
            >
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </button>

            {/* Upgrade CTA (free only) */}
            {tier === "free" && (
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/billing");
                }}
                className="
                  w-full text-center px-3 py-2 text-sm
                  bg-gray-700 text-white hover:bg-gray-800
                  dark:bg-accent dark:text-black dark:hover:bg-accent/80
                  rounded-md
                "
              >
                Upgrade to Premium →
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}