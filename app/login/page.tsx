
import React, { Suspense } from "react";
import nextDynamic from "next/dynamic";

// Skip prerender/SSR for this route
export const dynamic = "force-dynamic";

// Load the client-only login UI in the browser
const LoginClient = nextDynamic(() => import("./LoginClient"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}