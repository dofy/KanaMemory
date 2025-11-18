import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kana.yahaha.net"),
  title: "假名記憶 - Kana Memory",
  description:
    "智能互動式日語假名學習應用，支持平假名、片假名、羅馬音多模式練習，配有標準發音，助你輕鬆掌握 104 個假名",
  keywords: [
    "假名",
    "平假名",
    "片假名",
    "日語學習",
    "五十音",
    "日文",
    "kana",
    "hiragana",
    "katakana",
  ],
  authors: [
    { name: "Seven Yu", url: "mailto:dofyyu@gmail.com" },
    { name: "yahaha.net", url: "https://yahaha.net" },
  ],
  creator: "Seven Yu",
  publisher: "yahaha.net",
  openGraph: {
    title: "假名記憶 - 智能日語假名學習工具",
    description: "互動式日語假名練習應用，輕鬆掌握平假名與片假名",
    url: "https://kana.yahaha.net",
    siteName: "假名記憶",
    type: "website",
    locale: "zh_TW",
  },
  twitter: {
    card: "summary",
    title: "假名記憶 - Kana Memory",
    description: "智能互動式日語假名學習應用",
  },
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
