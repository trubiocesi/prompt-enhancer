// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '../lib/supabaseServer';
import HomeClient from './page.client';

export default async function HomePage() {
  // 1. Create the Supabase server client using the incoming cookies
  const supabase = await createServerSupabase();
  // 2. Check if there's an active session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3. If no session, redirect to /login, preserving the “next” path
  if (!session) {
    redirect(`/login?next=${encodeURIComponent('/')}`);
  }

  // 4. Authenticated → render the interactive client component
  return <HomeClient />;
}