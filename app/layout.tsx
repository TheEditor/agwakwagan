import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agwakwagan - Kanban Board",
  description: "A beautiful desktop-first kanban board application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
