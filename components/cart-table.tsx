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

const CartTable = ({ cart }: { cart?: Cart }) => {

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
                      <span>€ {item.price}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
