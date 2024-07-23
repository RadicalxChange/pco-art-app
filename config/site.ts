import { env } from "@/env.mjs";

interface SiteConfig {
  name: string;
  title: string;
  emoji: string;
  description: string;
  localeDefault: string;
}

export const siteConfig: SiteConfig = {
  name: "PCO Art",
  title: "PCO Art",
  emoji: "⚡",
  description: "PCO Art",
  localeDefault: "en",
};
