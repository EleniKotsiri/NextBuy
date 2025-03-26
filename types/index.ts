// Grab from Zod Schemas
import { z } from "zod";
import { insertProductSchema, cartItemSchema, insertCartSchema } from "@/lib/validators";

// Product fields' types are infered from the zod schema, and we also apply extra fields
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};

// Cart Types
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof insertCartSchema>;