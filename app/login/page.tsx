"use client";

// Tell Next.js never to prerender this route
export const dynamic = "force-dynamic";

import LoginClient from "./LoginClient";

export default function Page() {
  return <LoginClient />;
}