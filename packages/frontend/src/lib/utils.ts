import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string) {
  const dtNoMs = date.split(".")[0]
  return dtNoMs!.replace("T", " ")
}
