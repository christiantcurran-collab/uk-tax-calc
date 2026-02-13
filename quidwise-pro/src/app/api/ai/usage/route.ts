import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getOrCreateUsage, getCurrentBillingPeriod } from '@/lib/ai';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getOrCreateUsage(user.id, getCurrentBillingPeriod());

    return NextResponse.json({
      period: getCurrentBillingPeriod(),
      receipt_scans_used: usage.receipt_scans,
      receipt_scans_limit: 50,
      queries_used: usage.categorisation_queries,
      queries_limit: 15,
      budget_used_pence: usage.estimated_cost_pence,
      budget_limit_pence: 200,
      budget_remaining_pence: 200 - usage.estimated_cost_pence,
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}

