import { z } from "zod";
import { UI_STYLES, ANIMATION_LEVELS, SUPPORTED_FONTS } from "@/src/lib/cms/constants";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const personNameSchema = z.string().trim().min(2).max(120);

export const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .regex(/^[0-9+\-\s().]{0,40}$/, "Invalid phone number");

export const messageSchema = z.string().trim().min(10).max(5000);

export const shortTextSchema = z.string().trim().max(200);

export const longTextSchema = z.string().trim().max(20000);

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

export const uiStyleSchema = z.enum(UI_STYLES);

export const animationLevelSchema = z.enum(ANIMATION_LEVELS);

export const fontSchema = z.enum(SUPPORTED_FONTS);

export const contactFormSchema = z.object({
  full_name: personNameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  message: messageSchema,
  source: z.enum(["contact", "investor"]).optional(),
  enquiry_type: z.string().trim().max(80).optional(),
  website: z.string().max(0).optional(),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(120).optional(),
});

export const reviewSchema = z.object({
  name: personNameSchema,
  company_name: z.string().trim().max(160).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  review_text: z.string().trim().min(10).max(2000),
  image_url: z.string().trim().url().max(2000).optional().or(z.literal("")),
});

export function parseForm<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { error: issue?.message || "Invalid input", data: null };
  }
  return { error: null, data: result.data };
}
