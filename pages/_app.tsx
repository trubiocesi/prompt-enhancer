import type { AppProps } from "next/app";
import "../styles/globals.css";  // or wherever your Tailwind/CSS lives

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
