// pages/login.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const rawNext = router.query.next;
  const nextPath =
    typeof rawNext === "string" && rawNext.length > 0 ? rawNext : "/";

  // 1️⃣ Hold off on loading Supabase until we’re in the browser
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // dynamically import so nothing runs at module load time on the server
    import("../lib/supabaseClient").then(({ supabaseClient }) => {
      setSupabase(supabaseClient);

      // fetch current session
      supabaseClient.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });

      // listen for login/logout
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_, s) => {
        setSession(s);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  // 2️⃣ When we detect a session, redirect
  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [session, nextPath, router]);

  // 3️⃣ Show a loading state until the Supabase client is ready
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading authentication…
      </div>
    );
  }

  // 4️⃣ Render the Auth UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl">
        <h1 className="text-2xl mb-6 text-center">Sign In</h1>
        <Auth
          supabaseClient={supabase}
          providers={["github", "google"]}
          magicLink
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}