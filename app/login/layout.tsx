"use client";

// Forces everything under /login to be a client-only subtree.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}