import "@/styles/app.css";
import "@/styles/gradient.css";
import "@/styles/periphery.css";
import localFont from "next/font/local";

import RootProvider from "@/components/providers/root-provider";
import { siteConfig } from "@/config/site";
import { env } from "@/env.mjs";

const url = env.SITE_URL || "http://localhost:3000";

export const metadata = {
  title: `${siteConfig.name} - ${siteConfig.description}`,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: url?.toString(),
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

const suisseIntlFont = localFont({
  src: "../assets/fonts/SuisseIntl-Medium.ttf",
  variable: "--font-suisse-intl",
  display: "swap",
});

const inferiFont = localFont({
  src: "../assets/fonts/Inferi-Trial-Light.otf",
  variable: "--font-inferi",
  display: "swap",
});

const injurialFont = localFont({
  src: "../assets/fonts/Injurial-Regular.otf",
  variable: "--font-injurial",
  display: "swap",
});

export default function RootLayout({ children }: any) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${suisseIntlFont.variable} ${inferiFont.variable} ${injurialFont.variable}`}
    >
      <body className="min-h-screen bg-off-white font-sans text-black antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
