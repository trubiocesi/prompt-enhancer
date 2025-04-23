"use client";
/** 
* Ensure this page is always rendered client-side 
* so hooks like useSearchParams() work without Suspense boundaries 
*/
export const dynamic = 'force-dynamic';

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";

  // ▶️ Use the proper Session type
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1️⃣ Load any existing session on mount
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // 2️⃣ Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      // name the param you use, ignore the event
      (_event, newSession: Session | null) => {
        setSession(newSession);
      }
    );

    // 3️⃣ Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 4️⃣ Redirect once we have a session
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
          providers={['github', 'google']}  /* e.g. ['github'] if you enable GitHub in Supabase */
          magicLink={true}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}
