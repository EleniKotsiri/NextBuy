"use client";
import { Cart } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import RemoveProductButton from "./shared/product/remove-product-button";
import AddProductButton from "./shared/product/add-product-button";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader } from "lucide-react";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.cartItems.length === 0 ? (
        <div>
          Cart is empty.{" "}
          <Link href="/" className="underline">
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.cartItems.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <RemoveProductButton item={item} />
                      <span className="text-center">{item.qty}</span>
                      <AddProductButton item={item} />
                    </TableCell>
                    <TableCell className="text-right">
                      {/* <span>€ {item.price as any * item.qty}</span> */}
                      <span>€ {Number(item.price)}</span>
                      {/* <span><ProductPrice value={Number(item.price)} className="text-md" /></span> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card className="flex flex-col">
            <CardHeader className="p-4 pb-2">
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex w-full">
                <span>
                  Subtotal ({cart.cartItems.reduce((a, c) => a + c.qty, 0)}):{" "}
                  {formatCurrency(cart.cartItemsPrice)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-2 mt-auto">
              <Button
                size="lg"
                className="w-full md:text-sm"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push("/shipping-address"))
                }
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                Proceed To Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
