// app/login/page.tsx
import dynamic from "next/dynamic";

// dynamically import the client component, SSR disabled
const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function Page() {
  return <LoginClient />;
}