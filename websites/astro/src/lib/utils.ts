import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  if (!html) {
    return { text: "0 min read", minutes: 0, time: 0, words: 0 };
  }

  const wordsPerMinute = 200;
  const words = html.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return {
    text: `${minutes} min read`,
    minutes,
    time: minutes * 60 * 1000,
    words,
  };
}
