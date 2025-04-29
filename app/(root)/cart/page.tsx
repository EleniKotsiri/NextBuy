import { Metadata } from "next";
import CartTable from "@/components/cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

export const metadata: Metadata = {
  title: "My Cart",
};

const CartPage = async () => {
  const cart = await getMyCart();

  return (
    <>
      <CartTable
        cart={
          cart ? { ...cart, sessionCartId: cart.sessionCartId! } : undefined
        }
      />
    </>
  );
};

export default CartPage;
