// app/layout.tsx   (SERVER COMPONENT — no "use client" here)

import "./globals.css";
import AuthBar from "./components/AuthBar";  // This is a client component

export const metadata = {
  title: "PromptForge",
  description: "Enhance your AI prompts effortlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* AuthBar is a client boundary so it can use hooks */}
        <AuthBar />
        {children}
      </body>
    </html>
  );
}
