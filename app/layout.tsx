import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BM-Chat",
  description: "BMChat where you can chat with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="shortcut icon"
        href="speech-bubble-1423322_640.jpg"
        type="image/x-icon"
      />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
