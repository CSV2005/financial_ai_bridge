import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gig FinancialBridge — Financial identity for invisible workers",
  description:
    "A trusted alternative financial identity for gig workers, daily-wage earners, freelancers and informal workers — built on consented data and verified informal income. Hackathon prototype.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
