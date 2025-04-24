"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";

export default function LoginClient() {
    const router = useRouter();
    const [nextPath, setNextPath] = useState("/");


      // read ?next= from window.location when the component mounts
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     setNextPath(params.get("next") || "/");
   }, []);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { subscription } = supabaseClient.auth
      .onAuthStateChange((_e, newS) => setSession(newS)).data;
    return () => subscription.unsubscribe();
  }, []);

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