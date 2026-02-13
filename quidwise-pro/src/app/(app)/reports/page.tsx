'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { getCurrentTaxYear, calculateTaxSaving } from '@/lib/tax-year';
import { formatCurrency } from '@/lib/formatters';
import { HMRC_BOX_MAP } from '@/lib/expense-categories';
import {
  FileText,
  FileSpreadsheet,
  Download,
  TrendingUp,
} from 'lucide-react';
import type { Expense, Profile } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CategorySummary {
  box: string;
  total: number;
  claimable: number;
}

export default function ReportsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);

  const loadData = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const taxYear = getCurrentTaxYear();

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (profileData) setProfile(profileData);
    if (expenseData) {
      setExpenses(expenseData);

      // Build category summary
      const totals: Record<string, { total: number; claimable: number }> = {};
      expenseData.forEach((exp) => {
        const box = HMRC_BOX_MAP[exp.category_id] || 'Other';
        if (!totals[box]) totals[box] = { total: 0, claimable: 0 };
        totals[box].total += Number(exp.amount);
        totals[box].claimable += Number(exp.claimable_amount);
      });

      setCategorySummary(
        Object.entries(totals)
          .map(([box, vals]) => ({ box, ...vals }))
          .sort((a, b) => b.claimable - a.claimable)
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const grandTotalExpenses = categorySummary.reduce((s, c) => s + c.total, 0);
  const grandTotalClaimable = categorySummary.reduce((s, c) => s + c.claimable, 0);
  const taxSaving = calculateTaxSaving(grandTotalClaimable, profile?.income_band || 'basic');
  const taxYearLabel = getCurrentTaxYear().label;

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332] mb-6">
        Reports
      </h1>

      {/* Tax saving highlight */}
      <div className="bg-[#1B4332] text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">Estimated Tax Saving — {taxYearLabel}</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(taxSaving)}</p>
        </div>
        <TrendingUp size={40} className="text-[#95D5B2]" />
      </div>

      {/* SA103 Summary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-[#1B4332] mb-4">
          Tax Year Summary (SA103 Categories)
        </h2>

        {categorySummary.length === 0 ? (
          <p className="text-gray-400 py-4">
            No expenses recorded for this tax year yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    HMRC Category
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Total Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Claimable Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map((cat) => (
                  <tr key={cat.box} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">
                      {cat.box}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-500">
                      {formatCurrency(cat.total)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-[#1B4332]">
                      {formatCurrency(cat.claimable)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#95D5B2]/10 font-bold">
                  <td className="py-3 px-4 text-sm text-[#1B4332]">TOTAL</td>
                  <td className="py-3 px-4 text-right text-sm text-[#1B4332]">
                    {formatCurrency(grandTotalExpenses)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[#1B4332]">
                    {formatCurrency(grandTotalClaimable)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-[#1B4332] mb-4">
          Export & Download
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/api/reports/pdf"
            target="_blank"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#1B4332] hover:bg-gray-50 transition-all"
          >
            <FileText size={24} className="text-[#1B4332]" />
            <div>
              <div className="font-semibold text-gray-800">PDF Report</div>
              <div className="text-xs text-gray-500">
                Full report — print to PDF from browser
              </div>
            </div>
            <Download size={16} className="text-gray-400 ml-auto" />
          </a>

          <a
            href="/api/reports/csv?type=full"
            download
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#1B4332] hover:bg-gray-50 transition-all"
          >
            <FileSpreadsheet size={24} className="text-[#1B4332]" />
            <div>
              <div className="font-semibold text-gray-800">Full CSV Export</div>
              <div className="text-xs text-gray-500">
                Every expense with all fields
              </div>
            </div>
            <Download size={16} className="text-gray-400 ml-auto" />
          </a>

          <a
            href="/api/reports/csv?type=sa103"
            download
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#1B4332] hover:bg-gray-50 transition-all"
          >
            <FileSpreadsheet size={24} className="text-[#52B788]" />
            <div>
              <div className="font-semibold text-gray-800">SA103 Summary CSV</div>
              <div className="text-xs text-gray-500">
                Category totals for your tax return
              </div>
            </div>
            <Download size={16} className="text-gray-400 ml-auto" />
          </a>

          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 opacity-60">
            <Download size={24} className="text-gray-400" />
            <div>
              <div className="font-semibold text-gray-600">All Receipts (ZIP)</div>
              <div className="text-xs text-gray-400">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

