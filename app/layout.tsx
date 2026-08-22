import type { Metadata } from "next";
import { Playfair_Display, Karla } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "./components/ConfirmProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cahier du Chef",
  description:
    "Gestion de commandes et de production pour traiteurs et métiers de bouche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${karla.variable}`}>
      <body className="antialiased bg-cream text-ink font-sans">
        <ClerkProvider
          afterSignOutUrl="/"
          taskUrls={{ "reset-password": "/session-tasks/reset-password" }}
        >
          <ConfirmProvider>{children}</ConfirmProvider>
          <Toaster position="top-right" richColors />
        </ClerkProvider>
      </body>
    </html>
  );
}
