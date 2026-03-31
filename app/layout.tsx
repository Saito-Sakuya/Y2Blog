import type { Metadata } from "next";
import { Press_Start_2P, Noto_Serif_SC, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import Taskbar from "@/components/ui/Taskbar";
import ToastManager from "@/components/ui/ToastManager";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Y2K Pixel Blog",
  description: "A retro-themed pixel art driven blog experience.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} ${notoSerifSC.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
        data-theme="dark"
      >
        <ThemeProvider>
          {children}
          <Taskbar />
          <ToastManager />
        </ThemeProvider>
      </body>
    </html>
  );
}
