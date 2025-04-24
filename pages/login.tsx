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

  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // only runs in the browser, after React has hydrated
    import("../lib/supabaseClient").then(({ supabaseClient }) => {
      setSupabase(supabaseClient);
      supabaseClient.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_, s) => {
        setSession(s);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [session, nextPath, router]);

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading authentication…
      </div>
    );
  }

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