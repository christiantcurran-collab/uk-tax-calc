'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { getCurrentTaxYear, getDaysRemaining, calculateTaxSaving } from '@/lib/tax-year';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { EXPENSE_CATEGORIES, getCategoryById } from '@/lib/expense-categories';
import {
  Camera,
  Plus,
  RouteIcon,
  TrendingUp,
  Receipt,
  Lightbulb,
  PoundSterling,
  Zap,
} from 'lucide-react';
import type { Expense, Profile } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CategoryTotal {
  category_id: string;
  total: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [aiUsage, setAiUsage] = useState({ receipt_scans_used: 0, receipt_scans_limit: 50 });
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const taxYear = getCurrentTaxYear();

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) setProfile(profileData);

    // Load expenses for current tax year
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (expenseData) {
      setExpenses(expenseData);

      // Calculate category totals
      const totals: Record<string, number> = {};
      expenseData.forEach((exp) => {
        totals[exp.category_id] = (totals[exp.category_id] || 0) + Number(exp.claimable_amount);
      });
      setCategoryTotals(
        Object.entries(totals)
          .map(([category_id, total]) => ({ category_id, total }))
          .sort((a, b) => b.total - a.total)
      );
    }

    // Load AI usage
    try {
      const res = await fetch('/api/ai/usage');
      if (res.ok) {
        const usage = await res.json();
        setAiUsage(usage);
      }
    } catch {
      // AI usage endpoint optional
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalClaimable = expenses.reduce(
    (sum, e) => sum + Number(e.claimable_amount),
    0
  );
  const taxSaving = profile
    ? calculateTaxSaving(totalClaimable, profile.income_band)
    : 0;
  const daysRemaining = getDaysRemaining();
  const taxYearLabel = getCurrentTaxYear().label;

  // Find missing categories
  const usedCategories = new Set(expenses.map((e) => e.category_id));
  const missingCategories = EXPENSE_CATEGORIES.filter(
    (c) =>
      !usedCategories.has(c.id) &&
      (profile?.preferred_categories?.includes(c.id) ?? true)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332]">
            {profile?.full_name ? `Hi, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">
            {taxYearLabel} Tax Year — {daysRemaining} days remaining
          </p>
        </div>
        {profile?.subscription_status === 'trialing' && profile.trial_ends_at && (
          <div className="mt-3 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4A261]/20 text-[#92400e] px-4 py-2 text-sm">
            Trial ends {formatDate(profile.trial_ends_at)}
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#52B788]">
            <PoundSterling size={18} />
            <span className="text-sm text-gray-500 font-medium">Total Claimable</span>
          </div>
          <div className="text-3xl font-bold text-[#1B4332]">{formatCurrency(totalClaimable)}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#1B4332]">
            <TrendingUp size={18} />
            <span className="text-sm text-gray-500 font-medium">Tax Saving</span>
          </div>
          <div className="text-3xl font-bold text-[#1B4332] text-[#52B788]">
            {formatCurrency(taxSaving)}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Receipt size={18} />
            <span className="text-sm text-gray-500 font-medium">Expenses Logged</span>
          </div>
          <div className="text-3xl font-bold text-[#1B4332]">{expenses.length}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Zap size={18} />
            <span className="text-sm text-gray-500 font-medium">AI Scans Left</span>
          </div>
          <div className="text-3xl font-bold text-[#1B4332]">
            {aiUsage.receipt_scans_limit - aiUsage.receipt_scans_used}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link
          href="/scan"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow cursor-pointer animate-pulse-green"
        >
          <Camera className="text-[#1B4332]" size={24} />
          <span className="text-sm font-semibold text-[#1B4332]">Scan Receipt</span>
        </Link>
        <Link
          href="/expenses/new"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow cursor-pointer"
        >
          <Plus className="text-[#1B4332]" size={24} />
          <span className="text-sm font-semibold text-[#1B4332]">Add Expense</span>
        </Link>
        <Link
          href="/mileage"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow cursor-pointer"
        >
          <RouteIcon className="text-[#1B4332]" size={24} />
          <span className="text-sm font-semibold text-[#1B4332]">Log Mileage</span>
        </Link>
      </div>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-4">
            Expenses by Category
          </h2>
          <div className="space-y-3">
            {categoryTotals.map((ct) => {
              const cat = getCategoryById(ct.category_id);
              const percentage = totalClaimable > 0
                ? (ct.total / totalClaimable) * 100
                : 0;
              return (
                <div key={ct.category_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {cat?.name || ct.category_id}
                    </span>
                    <span className="text-gray-500">{formatCurrency(ct.total)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B4332] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1B4332]">Recent Expenses</h2>
          <Link
            href="/expenses"
            className="text-sm text-[#1B4332] font-medium hover:underline"
          >
            View all →
          </Link>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Receipt size={40} className="mx-auto mb-3 opacity-50" />
            <p>No expenses yet.</p>
            <p className="text-sm mt-1">
              <Link href="/scan" className="text-[#1B4332] font-medium hover:underline">
                Scan your first receipt
              </Link>{' '}
              or{' '}
              <Link href="/expenses/new" className="text-[#1B4332] font-medium hover:underline">
                add one manually
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((exp) => {
              const cat = getCategoryById(exp.category_id);
              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {exp.receipt_image_path && (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">
                        {exp.merchant || exp.description || 'Expense'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(exp.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#1B4332]">
                      {formatCurrency(Number(exp.claimable_amount))}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#95D5B2]/30 text-[#1B4332] text-[10px]">
                      {cat?.hmrcCategory || exp.category_id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Missing category nudge */}
      {missingCategories.length > 0 && (
        <div className="bg-[#F4E9D8] rounded-2xl p-6 flex items-start gap-3">
          <Lightbulb className="text-[#F4A261] shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-[#1B4332]">
              You haven&apos;t logged any <strong>{missingCategories[0].name}</strong> expenses yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Many freelancers miss claiming these. Check if you have any business {missingCategories[0].name.toLowerCase()} costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

