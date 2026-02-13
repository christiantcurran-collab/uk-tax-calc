'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { EXPENSE_CATEGORIES, getHmrcBox } from '@/lib/expense-categories';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import Link from 'next/link';

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>}>
      <NewExpenseContent />
    </Suspense>
  );
}

function NewExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const prefillCategory = searchParams.get('category');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [vatRegistered, setVatRegistered] = useState(false);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(prefillCategory || '');
  const [isPartial, setIsPartial] = useState(false);
  const [businessProportion, setBusinessProportion] = useState(100);
  const [includesVat, setIncludesVat] = useState(false);
  const [vatAmount, setVatAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const loadExpense = useCallback(async () => {
    if (!editId) return;
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', editId)
      .single();

    if (data) {
      setAmount(String(data.amount));
      setDate(data.date);
      setMerchant(data.merchant || '');
      setDescription(data.description || '');
      setCategoryId(data.category_id);
      setIsPartial(data.is_partial_claim);
      setBusinessProportion(data.business_proportion);
      setIncludesVat(data.includes_vat);
      setVatAmount(data.vat_amount ? String(data.vat_amount) : '');
      setPaymentMethod(data.payment_method || '');
      setNotes(data.notes || '');
    }
    setLoading(false);
  }, [editId]);

  useEffect(() => {
    // Check VAT status
    const checkVat = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('vat_registered')
        .eq('id', user.id)
        .single();
      if (profile) setVatRegistered(profile.vat_registered);
    };
    checkVat();
    loadExpense();
  }, [loadExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !categoryId) {
      setToast({ message: 'Please fill in amount, date, and category', type: 'error' });
      return;
    }

    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let receiptPath = null;

    // Upload receipt if provided
    if (receiptFile) {
      const ext = receiptFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile);
      if (!uploadError) {
        receiptPath = filePath;
      }
    }

    const expenseData = {
      user_id: user.id,
      amount: parseFloat(amount),
      date,
      merchant: merchant || null,
      description: description || null,
      category_id: categoryId,
      hmrc_box: getHmrcBox(categoryId),
      is_partial_claim: isPartial,
      business_proportion: isPartial ? businessProportion : 100,
      includes_vat: includesVat,
      vat_amount: includesVat && vatAmount ? parseFloat(vatAmount) : null,
      payment_method: paymentMethod || null,
      notes: notes || null,
      entry_method: 'manual' as const,
      ...(receiptPath && { receipt_image_path: receiptPath }),
    };

    if (editId) {
      const { error } = await supabase
        .from('expenses')
        .update({ ...expenseData, updated_at: new Date().toISOString() })
        .eq('id', editId);

      if (error) {
        setToast({ message: 'Failed to update expense', type: 'error' });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('expenses').insert(expenseData);
      if (error) {
        setToast({ message: 'Failed to save expense', type: 'error' });
        setSaving(false);
        return;
      }
    }

    router.push('/expenses');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/expenses" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#1B4332]">
          {editId ? 'Edit Expense' : 'Add Expense'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1.5">Amount (£)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900 text-2xl font-bold"
            placeholder="0.00"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            required
          />
        </div>

        {/* Merchant */}
        <div>
          <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1.5">Merchant / Payee</label>
          <input
            id="merchant"
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            placeholder="e.g. Amazon, Starbucks"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            rows={2}
            placeholder="What was this expense for?"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">HMRC Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            required
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} — {cat.hmrcCategory}
              </option>
            ))}
          </select>
        </div>

        {/* Partial claim */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <div>
            <div className="font-medium text-gray-700 text-sm">Partly personal?</div>
            <div className="text-xs text-gray-500">Only claim the business proportion</div>
          </div>
          <button
            type="button"
            onClick={() => setIsPartial(!isPartial)}
            className={`w-12 h-6 rounded-full transition-all ${isPartial ? 'bg-[#1B4332]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPartial ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {isPartial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business proportion: {businessProportion}%</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={businessProportion}
              onChange={(e) => setBusinessProportion(Number(e.target.value))}
              className="w-full accent-[#1B4332]"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>10%</span>
              <span>100%</span>
            </div>
            {amount && (
              <p className="text-sm text-[#52B788] font-medium mt-1">
                Claimable: £{(parseFloat(amount) * businessProportion / 100).toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* VAT */}
        {vatRegistered && (
          <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
              <div>
                <div className="font-medium text-gray-700 text-sm">Includes VAT?</div>
              </div>
              <button
                type="button"
                onClick={() => setIncludesVat(!includesVat)}
                className={`w-12 h-6 rounded-full transition-all ${includesVat ? 'bg-[#1B4332]' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${includesVat ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {includesVat && (
              <div>
                <label htmlFor="vat" className="block text-sm font-medium text-gray-700 mb-1.5">VAT Amount (£)</label>
                <input
                  id="vat"
                  type="number"
                  step="0.01"
                  value={vatAmount}
                  onChange={(e) => setVatAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="0.00"
                />
              </div>
            )}
          </>
        )}

        {/* Receipt upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt (optional)</label>
          <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1B4332] hover:bg-gray-50 cursor-pointer transition-all">
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {receiptFile ? receiptFile.name : 'Click to upload receipt image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        {/* Payment method */}
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method (optional)</label>
          <select
            id="payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
          >
            <option value="">Select</option>
            <option value="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">Card</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            rows={2}
            placeholder="Any additional notes..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Save size={18} />
              {editId ? 'Update Expense' : 'Save Expense'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

