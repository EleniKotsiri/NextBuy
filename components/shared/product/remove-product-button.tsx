'use client';
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { removeItemFromCart } from "@/lib/actions/cart.actions";
import { Loader, Minus } from "lucide-react";

const RemoveProductButton = ({ item }: { item: CartItem }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      variant="outline"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await removeItemFromCart(item.productId);
          toast({
            variant: res.success ? "default" : "destructive",
            description: res.message,
          });
        })
      }
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Minus className="w-4 h-4" />
      )}
    </Button>
  );
};

export default RemoveProductButton;
