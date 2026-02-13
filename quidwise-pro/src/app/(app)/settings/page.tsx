'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { EXPENSE_CATEGORIES } from '@/lib/expense-categories';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  User,
  CreditCard,
  Zap,
  Download,
  Trash2,
  Save,
  ExternalLink,
} from 'lucide-react';
import type { Profile } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

const INCOME_BANDS = [
  { value: 'basic', label: 'Under £50,270 (20%)' },
  { value: 'higher', label: '£50,271 – £125,140 (40%)' },
  { value: 'additional', label: 'Over £125,140 (45%)' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [aiUsage, setAiUsage] = useState({
    receipt_scans_used: 0,
    queries_used: 0,
    budget_used_pence: 0,
  });

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [employmentType, setEmploymentType] = useState('sole_trader');
  const [incomeBand, setIncomeBand] = useState('basic');
  const [vatRegistered, setVatRegistered] = useState(false);
  const [mileageMethod, setMileageMethod] = useState('simplified');
  const [homeOfficeMethod, setHomeOfficeMethod] = useState('flat_rate');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
      setBusinessName(data.business_name || '');
      setEmploymentType(data.employment_type || 'sole_trader');
      setIncomeBand(data.income_band || 'basic');
      setVatRegistered(data.vat_registered || false);
      setMileageMethod(data.mileage_method || 'simplified');
      setHomeOfficeMethod(data.home_office_method || 'flat_rate');
      setSelectedCategories(data.preferred_categories || EXPENSE_CATEGORIES.map((c) => c.id));
    }

    try {
      const res = await fetch('/api/ai/usage');
      if (res.ok) {
        const usage = await res.json();
        setAiUsage(usage);
      }
    } catch {
      // optional
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        business_name: businessName || null,
        employment_type: employmentType,
        income_band: incomeBand,
        vat_registered: vatRegistered,
        mileage_method: mileageMethod,
        home_office_method: homeOfficeMethod,
        preferred_categories: selectedCategories,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setToast({ message: 'Failed to save settings', type: 'error' });
    } else {
      setToast({ message: 'Settings saved', type: 'success' });
    }
    setSaving(false);
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setToast({ message: 'Failed to open billing portal', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? All your data will be permanently deleted. This cannot be undone.')) return;
    if (!confirm('This is your last chance. Delete everything?')) return;

    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete all user data
    await supabase.from('expenses').delete().eq('user_id', user.id);
    await supabase.from('mileage').delete().eq('user_id', user.id);
    await supabase.from('saved_routes').delete().eq('user_id', user.id);
    await supabase.from('ai_usage').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const subscriptionLabel = {
    none: 'No subscription',
    trialing: 'Free Trial',
    active: 'Active',
    past_due: 'Past Due',
    cancelled: 'Cancelled',
    expired: 'Expired',
  }[profile?.subscription_status || 'none'];

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332] mb-8">
        Settings
      </h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-[#1B4332]" />
          <h2 className="text-lg font-bold text-[#1B4332]">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            >
              <option value="sole_trader">Sole Trader</option>
              <option value="limited_company">Limited Company</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Income Band</label>
            <select
              value={incomeBand}
              onChange={(e) => setIncomeBand(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            >
              {INCOME_BANDS.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <span className="font-medium text-gray-700 text-sm">VAT Registered</span>
            <button
              type="button"
              onClick={() => setVatRegistered(!vatRegistered)}
              className={`w-12 h-6 rounded-full transition-all ${
                vatRegistered ? 'bg-[#1B4332]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  vatRegistered ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expense Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#1B4332] mb-4">
          Expense Preferences
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mileage Method</label>
            <select
              value={mileageMethod}
              onChange={(e) => setMileageMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            >
              <option value="simplified">Simplified (flat rate per mile)</option>
              <option value="actual">Actual costs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Home Office Method</label>
            <select
              value={homeOfficeMethod}
              onChange={(e) => setHomeOfficeMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
            >
              <option value="flat_rate">Flat rate</option>
              <option value="actual">Actual costs (proportional)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 mb-2">Relevant Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332] font-medium'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full flex items-center justify-center gap-2 mb-6"
      >
        {saving ? <LoadingSpinner size="sm" /> : (
          <>
            <Save size={18} />
            Save Settings
          </>
        )}
      </button>

      {/* Subscription */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} className="text-[#1B4332]" />
          <h2 className="text-lg font-bold text-[#1B4332]">Subscription</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Plan</span>
            <span className="font-medium">QuidWise Pro — £5/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile?.subscription_status === 'active' ? 'badge-green' :
              profile?.subscription_status === 'trialing' ? 'badge-amber' : 'badge-red'
            }`}>
              {subscriptionLabel}
            </span>
          </div>
          {profile?.trial_ends_at && profile.subscription_status === 'trialing' && (
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Trial ends</span>
              <span className="font-medium">{formatDate(profile.trial_ends_at)}</span>
            </div>
          )}
          {profile?.current_period_end && (
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Next billing date</span>
              <span className="font-medium">{formatDate(profile.current_period_end)}</span>
            </div>
          )}
        </div>

        {profile?.stripe_customer_id && (
          <button
            onClick={handleManageSubscription}
            className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 w-full mt-4 flex items-center justify-center gap-2 text-sm"
          >
            <ExternalLink size={16} />
            Manage Subscription
          </button>
        )}
      </div>

      {/* AI Usage */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-[#1B4332]" />
          <h2 className="text-lg font-bold text-[#1B4332]">AI Usage This Month</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Receipt Scans</span>
              <span className="font-medium">{aiUsage.receipt_scans_used} / 50</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-[#1B4332] rounded-full transition-all"
                style={{ width: `${(aiUsage.receipt_scans_used / 50) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Expense Questions</span>
              <span className="font-medium">{aiUsage.queries_used} / 15</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-[#1B4332] rounded-full transition-all"
                style={{ width: `${(aiUsage.queries_used / 15) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Budget Used</span>
              <span className="font-medium">
                {formatCurrency(aiUsage.budget_used_pence / 100)} / £2.00
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-[#F4A261] rounded-full transition-all"
                style={{ width: `${(aiUsage.budget_used_pence / 200) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Download size={20} className="text-[#1B4332]" />
          <h2 className="text-lg font-bold text-[#1B4332]">Data</h2>
        </div>

        <div className="space-y-3">
          <a
            href="/api/reports/csv?type=full"
            download
            className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <span className="text-sm font-medium text-gray-700">
              Export All Data (CSV)
            </span>
            <Download size={16} className="text-gray-400" />
          </a>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-[#E76F51]/20">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={20} className="text-[#E76F51]" />
          <h2 className="text-lg font-bold text-[#E76F51]">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account and all associated data.
          This action cannot be undone.
        </p>
        <button onClick={handleDeleteAccount} className="bg-[#E76F51] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d4573b] transition-all duration-200 text-sm">
          Delete My Account
        </button>
      </div>
    </div>
  );
}

