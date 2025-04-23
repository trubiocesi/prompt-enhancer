"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next   = params.get("next") || "/";

  const [session, setSession] = useState<any>(null);

  // check existing session + subscribe
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session);
    });
    const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        // …
      })
    return () => subscription.unsubscribe();
  }, []);

  // redirect once logged in
  useEffect(() => {
    if (session) {
      router.replace(next);
    }
  }, [session, next, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl backdrop-blur-sm">
        <h1 className="text-2xl mb-6 text-center">Sign In</h1>
        <Auth
          supabaseClient={supabaseClient}
          providers={["github", "google"]}
          magicLink={true}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}