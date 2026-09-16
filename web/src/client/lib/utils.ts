import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string) {
  if (!name) return "";
  const [first, second] = name.split(" ");
  return (first?.[0] ?? "") + (second?.[0] ?? "");
}
