import type { Metadata } from "next";
import { Jura, Judson } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { SplashGateProvider } from "@/components/splash-gate";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
});

const judson = Judson({
  variable: "--font-judson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SITE_NAME = "Manté Amoblamientos";
const SITE_DESCRIPTION =
  "Diseñamos, fabricamos e instalamos mobiliario a medida.";
const OG_IMAGE = {
  url: "/images/open-graph.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Cocina a medida de Manté junto al lema: diseñamos, fabricamos, instalamos mobiliario a medida.",
};

// og:image exige URL absoluta: sin dominio propio el fallback es el de Vercel,
// y en local queda localhost para que las previsualizaciones no apunten a producción.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${jura.variable} ${judson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashGateProvider>
          <Navbar />
          {children}
        </SplashGateProvider>
      </body>
    </html>
  );
}
