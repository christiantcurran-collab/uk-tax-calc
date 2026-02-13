import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getCurrentTaxYear } from '@/lib/tax-year';
import { HMRC_BOX_MAP } from '@/lib/expense-categories';

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'full'; // 'full' or 'sa103'

    const taxYear = getCurrentTaxYear();

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!expenses) {
      return NextResponse.json({ error: 'No expenses found' }, { status: 404 });
    }

    let csv = '';

    if (type === 'sa103') {
      // SA103 summary — just category totals
      const totals: Record<string, number> = {};
      expenses.forEach((exp) => {
        const box = HMRC_BOX_MAP[exp.category_id] || 'Other';
        totals[box] = (totals[box] || 0) + Number(exp.claimable_amount);
      });

      csv = 'HMRC Category,Total Claimable (£)\n';
      for (const [box, total] of Object.entries(totals)) {
        csv += `"${box}",${total.toFixed(2)}\n`;
      }
      const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
      csv += `"TOTAL",${grandTotal.toFixed(2)}\n`;
    } else {
      // Full export
      csv = 'Date,Merchant,Description,Category,HMRC Box,Amount (£),Business %,Claimable (£),VAT (£),Payment Method,Notes\n';
      expenses.forEach((exp) => {
        csv += `${exp.date},"${exp.merchant || ''}","${exp.description || ''}","${exp.category_id}","${exp.hmrc_box}",${Number(exp.amount).toFixed(2)},${exp.business_proportion},${Number(exp.claimable_amount).toFixed(2)},${exp.vat_amount ? Number(exp.vat_amount).toFixed(2) : ''},"${exp.payment_method || ''}","${exp.notes || ''}"\n`;
      });
    }

    const filename = type === 'sa103'
      ? `quidwise-sa103-summary-${taxYear.label.replace('/', '-')}.csv`
      : `quidwise-expenses-${taxYear.label.replace('/', '-')}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

