import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "FatScope – CT Metabolic Dashboard",
  description:
    "Epicardial, mediastinal fat and body composition viewer for CT scans with nnU-Net segmentation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen flex-col overflow-hidden bg-surface font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
