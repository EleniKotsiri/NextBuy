// Grab from Zod Schemas
import { z } from "zod";
import { insertProductSchema } from "@/lib/validators";

// Product fields' types are infered from the zod schema, and we also apply extra fields
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};