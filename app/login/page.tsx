"use client";
export const dynamic = "force-dynamic"; // ensure no SSR or prerender

import LoginClient from "./LoginClient";

export default function Page() {
  return <LoginClient />;
}