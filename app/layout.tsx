import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${poppins.variable} antialiased bg-slate-50 text-slate-900 font-sans`}
        >
          <Script
            src={process.env.MIDTRANS_IS_PRODUCTION === 'true' ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"}
            data-client-key={process.env.MIDTRANS_CLIENT_KEY}
            strategy="lazyOnload"
          />
          <ToastProvider>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
