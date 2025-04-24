import nextDynamic from "next/dynamic";  // ← give the import a different name

export const dynamic = "force-dynamic";  // ← Next.js directive (keep this name)

const LoginClient = nextDynamic(() => import("./LoginClient"), { ssr: false });

export default function Page() {
  return <LoginClient />;
}
