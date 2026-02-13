import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkAIBudget, scanReceipt, incrementAIUsage, estimateCostPence } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check AI budget
    const withinBudget = await checkAIBudget(user.id, 'scan');
    if (!withinBudget) {
      return NextResponse.json(
        {
          error: 'AI budget exceeded',
          message:
            "You've used your AI scans for this month. You can still add expenses manually. AI scanning resets on your next billing date.",
        },
        { status: 429 }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'Image data and mime type are required' },
        { status: 400 }
      );
    }

    const { result, usage } = await scanReceipt(imageBase64, mimeType);

    // Track usage
    await incrementAIUsage(user.id, 'scan', estimateCostPence(usage));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Receipt scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan receipt' },
      { status: 500 }
    );
  }
}

