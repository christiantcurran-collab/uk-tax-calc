import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from './supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MAX_MONTHLY_COST_PENCE = 200;
const ESTIMATED_COST_PER_SCAN_PENCE = 4;
const ESTIMATED_COST_PER_QUERY_PENCE = 2;

export function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getOrCreateUsage(userId: string, billingPeriod: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('billing_period', billingPeriod)
    .single();

  if (data) return data;

  const { data: newUsage } = await supabase
    .from('ai_usage')
    .insert({ user_id: userId, billing_period: billingPeriod })
    .select()
    .single();

  return newUsage!;
}

export async function checkAIBudget(
  userId: string,
  costType: 'scan' | 'query'
): Promise<boolean> {
  const usage = await getOrCreateUsage(userId, getCurrentBillingPeriod());
  const estimatedCost =
    costType === 'scan'
      ? ESTIMATED_COST_PER_SCAN_PENCE
      : ESTIMATED_COST_PER_QUERY_PENCE;
  return (usage.estimated_cost_pence + estimatedCost) <= MAX_MONTHLY_COST_PENCE;
}

export async function incrementAIUsage(
  userId: string,
  costType: 'scan' | 'query',
  costPence: number
) {
  const supabase = createServerSupabaseClient();
  const period = getCurrentBillingPeriod();
  const usage = await getOrCreateUsage(userId, period);

  const updates =
    costType === 'scan'
      ? {
          receipt_scans: (usage.receipt_scans || 0) + 1,
          estimated_cost_pence: (usage.estimated_cost_pence || 0) + costPence,
        }
      : {
          categorisation_queries: (usage.categorisation_queries || 0) + 1,
          estimated_cost_pence: (usage.estimated_cost_pence || 0) + costPence,
        };

  await supabase
    .from('ai_usage')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('billing_period', period);
}

export function estimateCostPence(usage: { input_tokens: number; output_tokens: number }): number {
  // Sonnet pricing: ~$3/M input, ~$15/M output
  const inputCostUSD = (usage.input_tokens / 1_000_000) * 3;
  const outputCostUSD = (usage.output_tokens / 1_000_000) * 15;
  const totalGBP = (inputCostUSD + outputCostUSD) * 0.8; // approx USD to GBP
  return Math.ceil(totalGBP * 100); // pence
}

export async function scanReceipt(imageBase64: string, mimeType: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Extract the following from this receipt. Return ONLY valid JSON, no other text.

{
  "merchant": "store/company name",
  "date": "YYYY-MM-DD",
  "total_amount": 0.00,
  "vat_amount": null or 0.00,
  "items": [{"description": "item name", "amount": 0.00}],
  "suggested_category": "one of: office-supplies, travel, working-from-home, professional-services, marketing, clothing, training, staff, stock-materials, financial",
  "category_reasoning": "brief reason for category suggestion",
  "confidence": 0.0 to 1.0
}

If you can't read a field clearly, set it to null. For suggested_category, pick the most likely HMRC allowable expense category for a UK self-employed person.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return { result: JSON.parse(cleaned), usage: response.usage };
}

export async function categoriseExpense(question: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 400,
    system: `You are a UK self-employed expense advisor. Answer whether the described expense is claimable as an HMRC allowable expense for a sole trader in the UK. Be accurate and cite the relevant HMRC category.

Rules:
- Be concise (2-4 sentences max)
- Always specify the HMRC category if claimable
- Mention if it's a partial claim (business proportion only)
- If not claimable, briefly explain why
- End with the category_id from this list: office-supplies, travel, working-from-home, professional-services, marketing, clothing, training, staff, stock-materials, financial, not-claimable
- Always add a disclaimer that this is general guidance, not tax advice

Return JSON only:
{
  "claimable": true/false/"partial",
  "answer": "your concise answer",
  "category_id": "the category or not-claimable",
  "hmrc_box": "SA103 box name if claimable"
}`,
    messages: [{ role: 'user', content: question }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return { result: JSON.parse(cleaned), usage: response.usage };
}

