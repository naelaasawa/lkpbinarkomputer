import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LKP BINAR KOMPUTER",
  description: "Learn computer skills with us.",
};

import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-slate-50 text-slate-900 font-sans`}
      >
        <MobileContainer>
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNavigation />
        </MobileContainer>
      </body>
    </html>
  );
}
