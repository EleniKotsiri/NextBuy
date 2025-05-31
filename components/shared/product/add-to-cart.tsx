"use client";
import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  // initialize router and useToast
  const router = useRouter();
  const { toast } = useToast();

  // useTransition() hook
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      // Handle success and error cases
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }
      toast({
        description: `${res.message || `${item.name} added to cart`}`,
        action: (
          <ToastAction
            className="bg-primary text-primary-foreground hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });
      return;
    });
  };
  
  const existItem = (cart?.cartItems as CartItem[])?.find(
    (cartItm) => cartItm.productId === item.productId
  );

  return existItem ? (
    <div className="flex items-center space-x-1">
      <Button className="w-4 h-4" type="button" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span>{existItem.qty}</span>
      <Button className="w-4 h-4" type="button" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}{' '}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
