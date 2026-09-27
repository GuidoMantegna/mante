import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Jura: () => ({ variable: "--font-jura" }),
  Judson: () => ({ variable: "--font-judson" }),
}));
vi.mock("@/app/globals.css", () => ({}));
vi.mock("@/components/ui/navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/splash-gate", () => ({
  SplashGateProvider: () => null,
}));

const { metadata } = await import("@/app/layout");

const OG_IMAGE_URL = "/images/open-graph.png";

describe("root metadata", () => {
  it("resolves social image URLs against an absolute origin", () => {
    const base = metadata.metadataBase;

    expect(base).toBeInstanceOf(URL);
    expect((base as URL).protocol).toMatch(/^https?:$/);
  });

  it("shares the open graph image with its intrinsic size and alt text", () => {
    const [image] = metadata.openGraph?.images as Array<{
      url: string;
      width: number;
      height: number;
      type: string;
      alt: string;
    }>;

    expect(image.url).toBe(OG_IMAGE_URL);
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.type).toBe("image/png");
    expect(image.alt).not.toHaveLength(0);
  });

  it("reuses the same image for the twitter card", () => {
    const twitter = metadata.twitter as {
      card: string;
      images: Array<{ url: string }>;
    };

    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images[0].url).toBe(OG_IMAGE_URL);
  });

  it("describes the site in Spanish for Argentina", () => {
    expect(metadata.openGraph?.locale).toBe("es_AR");
    expect(metadata.openGraph?.title).toBe("Manté Amoblamientos");
    expect(metadata.description).toBe(
      "Diseñamos, fabricamos e instalamos mobiliario a medida.",
    );
  });
});
