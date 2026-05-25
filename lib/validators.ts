import { z } from "zod";
export const listingSchema = z.object({ title:z.string().min(2), origin:z.string().min(2), category:z.string().min(2), price:z.coerce.number().positive(), seller:z.string().min(2), status:z.string().default("Active") });
export const moderationSchema = z.object({ content:z.string().min(1) });
