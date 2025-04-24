"use client";
export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params?.get("next") || "/";

  const [session, setSession] = useState<Session | null>(null);

  // On mount: fetch existing session & subscribe to changes
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // When session appears, redirect
  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [session, nextPath, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl backdrop-blur-sm">
        <h1 className="text-2xl mb-6 text-center">Sign In</h1>
        <Auth
          supabaseClient={supabaseClient}
          providers={["github", "google"]}
          magicLink
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}