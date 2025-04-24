import { redirect } from "next/navigation";
import { createServerSupabase } from "../lib/supabaseServer";
import HomeClient from "./page.client";

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/")}`);
  }

  return <HomeClient />;
}