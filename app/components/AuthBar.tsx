"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabaseClient } from "../../lib/supabaseClient";

export default function AuthBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1) Load initial session
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // 2) Subscribe to auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_event, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    // 3) Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-2">
      {user.user_metadata?.avatar_url && (
        <Image
          src={user.user_metadata.avatar_url}
          alt="Avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="text-sm text-gray-200">{user.email}</span>
      <button
        onClick={() => supabaseClient.auth.signOut()}
        className="text-sm text-red-400 hover:underline"
      >
        Sign Out
      </button>
    </div>
  );
}

