import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/context/ConfigContext";
import { LanguageProvider } from "@/context/LanguageContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-sans",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Rosée Beauté | Reserva tu Turno",
  description: "Tratamientos estéticos exclusivos para tu bienestar.",
};

import { SocialLinks } from "@/components/public/SocialLinks";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} font-sans antialiased text-stone-800 bg-white selection:bg-stone-200 min-h-screen relative overflow-x-hidden`}
      >
        <ConfigProvider>
          <LanguageProvider>
            {children}
            <SocialLinks />
          </LanguageProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
