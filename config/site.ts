import { env } from "@/env.mjs";

interface SiteConfig {
  name: string;
  title: string;
  description: string;
  localeDefault: string;
}

export const siteConfig: SiteConfig = {
  name: "PCO: A stewardship technology for art",
  title: "PCO: A stewardship technology for art",
  description:
    "Mint a stewardship licence for your artworks today! Art enriches society through the weaving of relations between the cultures that create it and the cultures that receive it. Partial common ownership of art is a new evolving system that allows artists, communities and holders of art to create structures of shared ownership and distribution of value that reflects those living relationships.",
  localeDefault: "en",
};
