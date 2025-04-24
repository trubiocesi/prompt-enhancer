import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // 1️⃣ Dynamically import the browser Supabase client on mount
  useEffect(() => {
    import("../lib/supabaseClient").then(({ supabaseClient }) => {
      setSupabaseClient(supabaseClient);

      // Fetch existing session
      supabaseClient.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });

      // Subscribe to auth changes
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
        setSession(newSession);
      });

      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    });
  }, []);

  // 2️⃣ Once we have a session, redirect
  useEffect(() => {
    if (!supabaseClient) return;      // wait for client to load
    if (session) {
      const rawNext = router.query.next;
      const nextPath =
        typeof rawNext === "string" && rawNext.length > 0 ? rawNext : "/";
      router.replace(nextPath);
    }
  }, [supabaseClient, session, router]);

  // 3️⃣ Loading state while Supabase client initializes
  if (!supabaseClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading authentication…
      </div>
    );
  }

  // 4️⃣ Render the Supabase Auth UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl">
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
