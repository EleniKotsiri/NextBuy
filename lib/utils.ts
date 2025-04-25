import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge CSS class names efficiently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert Prisma object into regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places (price)
export function formatNumberWithDecimal(num: number): string {
  // get int and decimal places (like the price component)
  // 49.99 -> 49:int 99:decimal
  const [int, decimal] = num.toString().split(".");

  return decimal
    ? `${int}.${decimal.padEnd(2, "0")}` // if the price is 49.9, we want to convert it to 49.90
    : `${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === "ZodError") {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function roundTwoDecimalPlaces(value: number | string): number {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is neither number nor string.");
  }
  // could just write:
  // return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  // or: Number(value).toFixed(2)
}