import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/env.mjs";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });
}

export function absoluteUrl(path: string) {
  return `${env.SITE_URL || "http://localhost:3000"}${path}`;
}

export function truncateStr(str: string, strLen: number) {
  if (str.length <= strLen) {
    return str;
  }

  const separator = "...";

  const sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);

  return (
    str.substr(0, frontChars) + separator + str.substr(str.length - backChars)
  );
}

export function calculateTimeString(remaining: number) {
  if (remaining <= 0) {
    return "0d 0h 0m 0s";
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function fromUnitsToSeconds(units: number, type: string) {
  let result = units;

  if (type === "minutes") {
    result = units * 60;
  } else if (type === "hours") {
    result = units * 60 * 60;
  } else if (type === "days") {
    result = units * 24 * 60 * 60;
  } else if (type === "weeks") {
    result = units * 7 * 24 * 60 * 60;
  } else if (type === "years") {
    result = units * 365 * 24 * 60 * 60;
  }

  return result;
}

export function fromSecondsToUnits(seconds: number, type: string) {
  let result = seconds;

  if (type === "minutes") {
    result = seconds / 60;
  } else if (type === "hours") {
    result = seconds / 60 / 60;
  } else if (type === "days") {
    result = seconds / 24 / 60 / 60;
  } else if (type === "weeks") {
    result = (seconds * 7) / 24 / 60 / 60;
  } else if (type === "years") {
    result = (seconds * 365) / 24 / 60 / 60;
  }

  return result;
}
