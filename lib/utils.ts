import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge CSS class names efficiently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Prisma object into regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}