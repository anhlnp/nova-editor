import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, DM_Serif_Display, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastNotification } from "@/components/ToastNotification";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

async function localeFromCookie(): Promise<Locale> {
  const cookie = (await cookies()).get("nova_locale")?.value;
  return cookie === "vi" ? "vi" : "en";
}

// FA-I05: localized <title>/<description> that track the chosen locale (SEO).
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getDictionary(await localeFromCookie());
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // FA-I03: <html lang> must track the chosen locale (a11y/SEO), read from the
  // same `nova_locale` cookie the client-side detector writes.
  const lang = await localeFromCookie();

  return (
    // suppressHydrationWarning: browser extensions (e.g. Katalon) may inject
    // attributes onto <html> after SSR, causing a harmless hydration mismatch.
    <html lang={lang} className={`${inter.variable} ${dmSerifDisplay.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <ToastNotification />
        </Providers>
      </body>
    </html>
  );
}
