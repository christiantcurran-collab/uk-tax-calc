'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { EXPENSE_CATEGORIES } from '@/lib/expense-categories';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STEPS = ['About You', 'Tax Details', 'Categories'];

const INCOME_BANDS = [
  { value: 'basic', label: 'Under £50,270', description: '20% tax rate' },
  { value: 'higher', label: '£50,271 – £125,140', description: '40% tax rate' },
  { value: 'additional', label: 'Over £125,140', description: '45% tax rate' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [employmentType, setEmploymentType] = useState('sole_trader');
  const [taxYear, setTaxYear] = useState('2025-26');
  const [incomeBand, setIncomeBand] = useState('basic');
  const [vatRegistered, setVatRegistered] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'office-supplies', 'travel', 'working-from-home', 'professional-services',
  ]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    await supabase.from('profiles').update({
      full_name: fullName || null,
      business_name: businessName || null,
      employment_type: employmentType,
      tax_year: taxYear,
      income_band: incomeBand,
      vat_registered: vatRegistered,
      preferred_categories: selectedCategories,
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg w-full">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div className={`w-full h-1.5 rounded-full ${i <= step ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />
              <span className={`text-xs mt-2 ${i <= step ? 'text-[#1B4332] font-medium' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: About You */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-[#1B4332] mb-2">About you</h2>
            <p className="text-gray-500 mb-6">Help us personalise your experience</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1.5">Business Name (optional)</label>
                <input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="Smith Consulting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'sole_trader', label: 'Sole Trader' },
                    { value: 'limited_company', label: 'Limited Company' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEmploymentType(opt.value)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        employmentType === opt.value
                          ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Tax Details */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-[#1B4332] mb-2">Tax details</h2>
            <p className="text-gray-500 mb-6">This helps us calculate your tax savings</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Year</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: '2025-26', label: '2025/26' },
                    { value: '2024-25', label: '2024/25' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTaxYear(opt.value)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        taxYear === opt.value
                          ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Income Band</label>
                <div className="space-y-2">
                  {INCOME_BANDS.map((band) => (
                    <button
                      key={band.value}
                      type="button"
                      onClick={() => setIncomeBand(band.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        incomeBand === band.value
                          ? 'border-[#1B4332] bg-[#1B4332]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-[#1B4332]">{band.label}</div>
                      <div className="text-sm text-gray-500">{band.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <div className="font-medium text-gray-700">VAT Registered?</div>
                  <div className="text-sm text-gray-500">Are you registered for VAT?</div>
                </div>
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
        )}

        {/* Step 3: Categories */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-[#1B4332] mb-2">Your categories</h2>
            <p className="text-gray-500 mb-6">
              Select the expense categories relevant to your work (you can change these later)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'border-[#1B4332] bg-[#1B4332]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    {selectedCategories.includes(cat.id) && (
                      <Check size={16} className="text-[#1B4332] shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : (
                <>
                  Go to Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

