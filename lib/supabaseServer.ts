// lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'

export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
}