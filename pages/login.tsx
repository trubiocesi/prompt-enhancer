"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  // nextPath may be a string array or undefined; normalize it
  const rawNext = router.query.next;
  const nextPath =
    typeof rawNext === "string" && rawNext.length > 0 ? rawNext : "/";

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [session, nextPath, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl">
        <h1 className="text-2xl mb-6 text-center">Sign In</h1>
        <Auth
          supabaseClient={supabaseClient}
          providers={[]}
          magicLink
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}

// Force Next.js to use Server-Side Rendering for this page
export async function getServerSideProps() {
  return { props: {} };
}