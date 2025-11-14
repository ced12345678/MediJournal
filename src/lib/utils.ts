import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNamespacedKey(key: string, userId: string) {
    return `healthsync-${userId}-${key}`;
}
