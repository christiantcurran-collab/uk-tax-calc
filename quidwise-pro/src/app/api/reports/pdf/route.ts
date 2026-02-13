import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getCurrentTaxYear, calculateTaxSaving } from '@/lib/tax-year';
import { HMRC_BOX_MAP } from '@/lib/expense-categories';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const taxYear = getCurrentTaxYear();

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    const { data: mileage } = await supabase
      .from('mileage')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0]);

    // Generate a simple HTML report that can be printed to PDF
    const totals: Record<string, { total: number; claimable: number }> = {};
    (expenses || []).forEach((exp) => {
      const box = HMRC_BOX_MAP[exp.category_id] || 'Other';
      if (!totals[box]) totals[box] = { total: 0, claimable: 0 };
      totals[box].total += Number(exp.amount);
      totals[box].claimable += Number(exp.claimable_amount);
    });

    const grandTotal = Object.values(totals).reduce((s, v) => s + v.claimable, 0);
    const taxSaving = calculateTaxSaving(grandTotal, profile?.income_band || 'basic');

    const totalMiles = (mileage || []).reduce(
      (sum, m) => sum + Number(m.miles) * (m.is_return_trip ? 2 : 1),
      0
    );
    const totalMileageClaim = (mileage || []).reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QuidWise Expense Report — ${taxYear.label}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
    h1 { color: #1B4332; border-bottom: 3px solid #1B4332; padding-bottom: 10px; }
    h2 { color: #1B4332; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; color: #6b7280; }
    .total-row { font-weight: bold; background: #f0fdf4; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; }
    .saving { background: #1B4332; color: white; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .saving .value { font-size: 32px; font-weight: bold; }
    .disclaimer { color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .logo { font-size: 24px; font-weight: bold; color: #1B4332; }
    .meta { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="logo">QuidWise Pro</div>
  <h1>Expense Report — ${taxYear.label} Tax Year</h1>
  <div class="meta">
    ${profile?.business_name ? `<p>Business: ${profile.business_name}</p>` : ''}
    ${profile?.full_name ? `<p>Name: ${profile.full_name}</p>` : ''}
    <p>Period: ${taxYear.start.toLocaleDateString('en-GB')} — ${taxYear.end.toLocaleDateString('en-GB')}</p>
    <p>Generated: ${new Date().toLocaleDateString('en-GB')}</p>
  </div>

  <div class="saving">
    <div>Estimated Tax Saving</div>
    <div class="value">£${taxSaving.toFixed(2)}</div>
  </div>

  <h2>Category Summary (SA103)</h2>
  <table>
    <thead>
      <tr>
        <th>HMRC Category</th>
        <th class="amount">Total Expenses</th>
        <th class="amount">Claimable Amount</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(totals)
        .map(
          ([box, vals]) =>
            `<tr><td>${box}</td><td class="amount">£${vals.total.toFixed(2)}</td><td class="amount">£${vals.claimable.toFixed(2)}</td></tr>`
        )
        .join('')}
      <tr class="total-row">
        <td>TOTAL</td>
        <td class="amount">£${Object.values(totals).reduce((s, v) => s + v.total, 0).toFixed(2)}</td>
        <td class="amount">£${grandTotal.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  ${
    totalMiles > 0
      ? `
  <h2>Mileage Summary</h2>
  <table>
    <tr><td>Total Business Miles</td><td class="amount">${totalMiles.toLocaleString()}</td></tr>
    <tr><td>Total Mileage Claim</td><td class="amount">£${totalMileageClaim.toFixed(2)}</td></tr>
    <tr><td>Trips Logged</td><td class="amount">${mileage?.length || 0}</td></tr>
  </table>
  `
      : ''
  }

  <h2>All Expenses (${expenses?.length || 0})</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Merchant</th>
        <th>Category</th>
        <th class="amount">Amount</th>
        <th class="amount">Claimable</th>
      </tr>
    </thead>
    <tbody>
      ${(expenses || [])
        .map(
          (exp) =>
            `<tr>
              <td>${new Date(exp.date).toLocaleDateString('en-GB')}</td>
              <td>${exp.merchant || exp.description || '—'}</td>
              <td>${exp.hmrc_box}</td>
              <td class="amount">£${Number(exp.amount).toFixed(2)}</td>
              <td class="amount">£${Number(exp.claimable_amount).toFixed(2)}</td>
            </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="disclaimer">
    <p>This report is generated by QuidWise Pro for informational purposes only.
    It does not constitute tax advice. Please consult a qualified accountant
    for advice specific to your circumstances.</p>
    <p>HMRC requires that you keep records for at least 5 years after the 31 January
    submission deadline of the relevant tax year.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="quidwise-report-${taxYear.label.replace('/', '-')}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF report error:', error);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}

