"use client";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n";
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        <I18nProvider>{children}</I18nProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
