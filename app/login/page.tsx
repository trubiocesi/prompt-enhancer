"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession, usesupabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  // If the user is already signed in, send them to home
  useEffect(() => {
    if (session) router.replace('/');
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-white">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl backdrop-blur-sm">
        <h1 className="text-2xl mb-6 text-center">Sign In to PromptForge</h1>
        <Auth
          supabaseClient={supabase}
          providers={['github', 'google']}
          magicLink={true}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          localization={{
            variables: {
              sign_in: { email_label: 'Your Email' }
            }
          }}
        />
      </div>
    </div>
  );
}