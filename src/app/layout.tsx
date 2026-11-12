import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ApexFit | Personal Coach",
  description: "Your personal training and nutrition companion.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "ApexFit",
    startupImage: [
      "/icons/icon-512.png"
    ]
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" >
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-primary/30">
        <ThemeProvider>
          <ToastProvider>
            <AppShell userId={session?.userId}>{children}</AppShell>
            {/* Service Worker Registration */}
            <Script
              id="sw-register"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                  }
                `,
              }}
            />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

