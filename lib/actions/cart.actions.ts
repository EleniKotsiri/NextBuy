"use server";
import { CartItem } from "@/types";
import {
  convertToPlainObject,
  formatError,
  roundTwoDecimalPlaces,
} from "../utils";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate Cart Prices
const calcPrice = (
  items: CartItem[]
): {
  cartItemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
} => {
  const cartItemsPrice = roundTwoDecimalPlaces(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = roundTwoDecimalPlaces(cartItemsPrice > 100 ? 0 : 10);
  const taxPrice = roundTwoDecimalPlaces(cartItemsPrice * 0.15);
  const totalPrice = roundTwoDecimalPlaces(
    cartItemsPrice + shippingPrice + taxPrice
  );

  return {
    cartItemsPrice: cartItemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(
  data: CartItem
): Promise<CartMessageResponse> {
  try {
    // Check for Cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get session and user id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Grab product from the database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found.");

    // Get cart
    const cart = await getMyCart();
    // Create a new cart if there's none already
    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId: userId,
        cartItems: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item])
      });

      // Add it to database
      await prisma.cart.create({
        data: newCart
      });

      // Revalidate product page
      revalidatePath(`/products/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };

    } else {
      // Check if item is already in cart
      const existItem = (cart?.cartItems as CartItem[]).find((cartItm) => cartItm.productId === item.productId);
      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error('Not enough stock');
        }
        // Increase the quantity
        (cart?.cartItems as CartItem[]).find((cartItm) => cartItm.productId === item.productId)!.qty = ++existItem.qty;
      } else {
        // When item does not exist in cart
        // Check stock
        if (product.stock < 1) throw new Error('Not enough stock');

        // Add item to cart.cartItems
        cart.cartItems.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          cartItems: cart.cartItems as Prisma.CartUpdatecartItemsInput[],
          ...calcPrice(cart.cartItems as CartItem[])
        }
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`
      }
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart(): Promise<GetMyCartResponse | undefined> {
  // Check for Cart cookie
  const cookiesObj = await cookies();
  const sessionCartId = cookiesObj.get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");

  // Get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from db
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    cartItems: cart.cartItems as CartItem[],
    cartItemsPrice: cart.cartItemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string): Promise<CartMessageResponse> {
  try {
    // Check for Cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Grab product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found.");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found.');

    // Check if that item exists in cart
    const existItem = (cart?.cartItems as CartItem[]).find((cartItm) => cartItm.productId === productId);
    if(!existItem) throw new Error('Item not found');

    // Check item's qty
    if (existItem.qty === 1) {
      // Remove from cart
      cart.cartItems = (cart.cartItems as CartItem[]).filter((cartItm) => cartItm.productId !== existItem.productId);
    } else {
      // Decrease the qty
      (cart.cartItems as CartItem[]).find((cartItm) => cartItm.productId === productId)!.qty = --existItem.qty;
    }
    
    // Update Cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        cartItems: cart.cartItems as Prisma.CartUpdatecartItemsInput[],
        ...calcPrice(cart.cartItems as CartItem[])
      }
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to remove item from cart'
    }
  }
}

// Define the CartMessageResponse type
export type CartMessageResponse = {
  success: boolean;
  message: string | any;
}

// Define the GetMyCartResponse type
export type GetMyCartResponse = {
  id: string;
  userId: string | null;
  sessionCartId: string | null;
  createdAt: Date;
  cartItems: CartItem[];
  cartItemsPrice: string;
  totalPrice: string;
  shippingPrice: string;
  taxPrice: string;
}