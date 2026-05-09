import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://virtual-hotel-sales-team.vercel.app"),
  title: {
    default: "my Sales TEAM AI · Synergistic Selling on Autopilot · MHSP",
    template: "%s · my Sales TEAM AI",
  },
  description:
    "The MHSP dual sales funnel — calculated + hustle — built into 11 AI sales agents. Explosive revenues for hotels, without fear. Powered by My Hospitality Sales Pro × Inntelligent CRM.",
  keywords: [
    "hotel sales",
    "AI sales",
    "MHSP",
    "My Hospitality Sales Pro",
    "Inntelligent CRM",
    "hotel revenue management",
    "RFP",
    "group sales",
  ],
  authors: [{ name: "My Hospitality Sales Pro" }],
  openGraph: {
    type: "website",
    siteName: "my Sales TEAM AI",
    title: "my Sales TEAM AI · Synergistic Selling on Autopilot",
    description:
      "The MHSP dual sales funnel — calculated + hustle — built into 11 AI sales agents. Explosive revenues for hotels, without fear.",
    url: "https://virtual-hotel-sales-team.vercel.app",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "my Sales TEAM AI · Synergistic Selling on Autopilot",
    description:
      "The MHSP dual funnel — calculated + hustle — built into 11 AI sales agents. Explosive revenues. No fear.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2447",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mhsp-cream text-mhsp-text">
        <AppChrome>{children}</AppChrome>
        <Toaster
          position="bottom-left"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",
            },
          }}
        />
      </body>
    </html>
  );
}
