'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { EXPENSE_CATEGORIES, getCategoryById } from '@/lib/expense-categories';
import { getCurrentTaxYear } from '@/lib/tax-year';
import {
  Plus,
  Camera,
  Search,
  Trash2,
  Edit3,
  Paperclip,
  Receipt,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Expense } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

const PAGE_SIZE = 25;

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const taxYear = getCurrentTaxYear();

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }

    if (searchQuery.trim()) {
      query = query.or(
        `merchant.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    const { data, count } = await query;
    if (data) setExpenses(data);
    if (count !== null) setTotal(count);
    setLoading(false);
  }, [page, categoryFilter, searchQuery]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from('expenses').delete().eq('id', id);
    setToast({ message: 'Expense deleted', type: 'success' });
    loadExpenses();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} expenses?`)) return;

    const supabase = createBrowserSupabaseClient();
    const ids = Array.from(selected);
    await supabase.from('expenses').delete().in('id', ids);
    setSelected(new Set());
    setToast({ message: `${ids.length} expenses deleted`, type: 'success' });
    loadExpenses();
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const toggleSelectAll = () => {
    if (selected.size === expenses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(expenses.map((e) => e.id)));
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332]">Expenses</h1>
        <div className="flex gap-3 mt-3 sm:mt-0">
          <Link href="/scan" className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 text-sm flex items-center gap-2 !px-4 !py-2">
            <Camera size={16} />
            Scan
          </Link>
          <Link href="/expenses/new" className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-2 !px-4 !py-2">
            <Plus size={16} />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Search merchant or description..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900 pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
              >
                <option value="all">All categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 flex items-center justify-between bg-[#1B4332]/5">
          <span className="text-sm font-medium text-[#1B4332]">
            {selected.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="text-sm text-[#E76F51] font-medium flex items-center gap-1 hover:underline"
          >
            <Trash2 size={14} />
            Delete selected
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center py-12">
          <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No expenses yet
          </h3>
          <p className="text-gray-400 mb-6">
            Scan your first receipt or add one manually.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/scan" className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md text-sm">
              Scan Receipt
            </Link>
            <Link href="/expenses/new" className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 text-sm">
              Add Manually
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.size === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Merchant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Claimable
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                    Receipt
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  const cat = getCategoryById(exp.category_id);
                  return (
                    <tr
                      key={exp.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(exp.id)}
                          onChange={() => toggleSelect(exp.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-800">
                          {exp.merchant || exp.description || '—'}
                        </div>
                        {exp.description && exp.merchant && (
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {exp.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#95D5B2]/30 text-[#1B4332] text-xs">
                          {cat?.hmrcCategory || exp.category_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-[#1B4332]">
                          {formatCurrency(Number(exp.claimable_amount))}
                        </span>
                        {exp.business_proportion < 100 && (
                          <div className="text-[10px] text-gray-400">
                            {exp.business_proportion}% of {formatCurrency(Number(exp.amount))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {exp.receipt_image_path ? (
                          <Paperclip size={14} className="mx-auto text-gray-400" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/expenses/new?edit=${exp.id}`}
                            className="text-gray-400 hover:text-[#1B4332]"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-gray-400 hover:text-[#E76F51]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {total} expenses · Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

