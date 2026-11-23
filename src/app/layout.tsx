import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BottomNav } from "@/components/layout/Nav";
import { DataBanner, Footer, TopBar } from "@/components/layout/Shell";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

const SITE_URL = process.env.SITE_URL ?? "https://grapevine-six-gr925.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Grapevine 開發者論壇", template: "%s｜Grapevine" },
  description: "建立在 GitHub Discussions 上的開發者論壇：技術問答、作者專欄、週刊共讀、職缺、匿名八卦牆與在地聚會。",
  openGraph: { type: "website", siteName: "Grapevine", locale: "zh_TW" },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#131017" },
  ],
};

// Applies a saved theme before first paint (see docs: preventing flash before hydration).
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-TW" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          跳到主要內容
        </a>
        <TopBar />
        <DataBanner />
        {children}
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
