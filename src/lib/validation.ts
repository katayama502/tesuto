import { z } from 'zod';

export const matchInputSchema = z
  .object({
    pairType: z.enum(['MM', 'WW', 'UNISEX', 'CUSTOM']),
    styleTags: z.array(z.string()).max(8).default([]),
    sizesA: z.array(z.string()).max(12).default([]),
    sizesB: z.array(z.string()).max(12).default([]),
    budgetMin: z.number().int().nonnegative(),
    budgetMax: z.number().int().nonnegative(),
    occasion: z.string().max(64).optional().nullable(),
  })
  .refine((value) => value.budgetMax >= value.budgetMin, {
    message: 'budgetMax must be greater than or equal to budgetMin',
    path: ['budgetMax'],
  });

export const productFilterSchema = z.object({
  query: z.string().max(120).optional(),
  genderLabel: z.enum(['mens', 'womens', 'unisex']).optional(),
});

export const saveBundleSchema = z.object({
  bundleId: z.string().cuid(),
});
