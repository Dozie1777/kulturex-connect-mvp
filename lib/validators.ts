import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
}).strict();

export const sellerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),
}).strict();

export const listingSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(3000),
  origin: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),
  priceMinor: z.number().int().min(50).max(10_000_000),
  stock: z.number().int().min(0).max(100_000),
}).strict();

export const checkoutSchema = z.object({
  listingId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
}).strict();

export const moderationSchema = z.object({ content:z.string().min(1).max(3000) }).strict();
