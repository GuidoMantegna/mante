import type { Metadata } from "next";
import { Jura, Judson } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
});

const judson = Judson({
  variable: "--font-judson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MANTÉ",
  description: "Mobiliario a medida",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jura.variable} ${judson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
