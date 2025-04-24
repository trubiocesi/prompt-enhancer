"use client";

// This makes everything under /login render purely in the browser
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}