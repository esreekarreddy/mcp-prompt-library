import { z } from 'zod';

export const IntentPatternSchema = z.object({
  keywords: z.array(z.string()).min(1),
  intent: z.string().min(1),
  suggestedItems: z.array(z.string()).min(1),
  priority: z.number().int().min(0).max(10),
});

export const IntentPatternsSchema = z.array(IntentPatternSchema);

export type ValidatedIntentPattern = z.infer<typeof IntentPatternSchema>;

export function validateIntentPatterns(data: unknown): ValidatedIntentPattern[] {
  const result = IntentPatternsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid intents.json: ${result.error.message}`);
  }
  return result.data;
}
