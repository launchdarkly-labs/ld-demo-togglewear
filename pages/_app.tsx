import type { AppProps } from "next/app";
import { Sora, Geist } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "@/styles/globals.css";

// next/font is only allowed in _app, not _document, so the CSS variable the
// Tailwind theme references is defined on a wrapper here.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

// Only SemiBold is used, on the NEW badge and the swag assistant launcher.
const geist = Geist({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-geist",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${sora.variable} ${geist.variable}`}>
      {/* The cart has to outlive a page change, so it is owned above the
          page rather than by any one of them. */}
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </div>
  );
}
