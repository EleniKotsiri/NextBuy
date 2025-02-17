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

// Format number with decimal places (price)
export function formatNumberWithDecimal(num: number) : string {
  // get int and decimal places (like the price component)
  // 49.99 -> 49:int 99:decimal
  const [int, decimal] = num.toString().split('.');

  return decimal
    ? `${int}.${decimal.padEnd(2, '0')}` // if the price is 49.9, we want to convert it to 49.90
    : `${int}.00`;
}