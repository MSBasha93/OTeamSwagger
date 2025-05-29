import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; // We'll create this
import Navbar from "@/components/specific/Navbar"; // We'll create this
import { Toaster } from "@/components/ui/toaster"; // Assuming shadcn/ui toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OTeam Platform",
  description: "Ticketing and Support Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}