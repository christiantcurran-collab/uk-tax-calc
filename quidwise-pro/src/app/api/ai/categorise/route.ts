import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkAIBudget, categoriseExpense, incrementAIUsage, estimateCostPence } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const withinBudget = await checkAIBudget(user.id, 'query');
    if (!withinBudget) {
      return NextResponse.json(
        {
          error: 'AI budget exceeded',
          message:
            "You've used your AI questions for this month. Questions reset on your next billing date.",
        },
        { status: 429 }
      );
    }

    const { question } = await req.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please describe the expense' },
        { status: 400 }
      );
    }

    const { result, usage } = await categoriseExpense(question);

    await incrementAIUsage(user.id, 'query', estimateCostPence(usage));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categorise error:', error);
    return NextResponse.json(
      { error: 'Failed to categorise expense' },
      { status: 500 }
    );
  }
}

