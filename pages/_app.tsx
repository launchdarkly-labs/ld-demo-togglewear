import type { AppProps } from "next/app";
import { Sora } from "next/font/google";
import "@/styles/globals.css";

// next/font is only allowed in _app, not _document, so the CSS variable the
// Tailwind theme references is defined on a wrapper here.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={sora.variable}>
      <Component {...pageProps} />
    </div>
  );
}
