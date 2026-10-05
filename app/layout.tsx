import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentor Me",
  description:
    "An AI mentor that reviews code, speaks the feedback, and learns your own review style.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
