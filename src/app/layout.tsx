import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApexFit | AI Personal Coach",
  description: "Your dynamic AI-powered fitness and nutrition coach.",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-primary/30">
        <ThemeProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            {/* Third-Party Scripts */}
            <Script src="https://unpkg.com/html5-qrcode" strategy="lazyOnload" />
            {/* Service Worker Registration */}
            <Script
              id="sw-register"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(function(registration) {
                        console.log('SW registered with scope: ', registration.scope);
                      }, function(err) {
                        console.log('SW registration failed: ', err);
                      });
                    });
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
