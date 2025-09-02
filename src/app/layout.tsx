import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mover Roster - Transport Business App",
  description: "Rostering app for transport business with login, clock in/out, and shift management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
