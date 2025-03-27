"use server";
import { CartItem } from "@/types";

export async function addItemToCart(item: CartItem): Promise<AddItemToCartResponse> {
  return {
    success: true,
    message: "Item added successfully"
  };
};

// Define the AddItemToCartResponse type
export interface AddItemToCartResponse {
  success: boolean;
  message: string | any;
};