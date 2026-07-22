import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdaBazar Admin Panel",
  description: "Administrative dashboard for AdaBazar C2C Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <AuthProvider>
          <AdminShell>
            {children}
          </AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
