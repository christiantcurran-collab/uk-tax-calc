import Link from 'next/link';
import { Check, X, ArrowRight } from 'lucide-react';

const comparisonRows = [
  { feature: 'Manual expense entry', free: true, pro: true },
  { feature: 'HMRC expense categories guide', free: true, pro: true },
  { feature: 'Savings estimator', free: true, pro: true },
  { feature: 'Expense tracking & storage', free: false, pro: true },
  { feature: 'AI receipt scanning (50/month)', free: false, pro: true },
  { feature: '"Can I claim this?" AI (15/month)', free: false, pro: true },
  { feature: 'Mileage tracker with saved routes', free: false, pro: true },
  { feature: 'HMRC SA103 category mapping', free: false, pro: true },
  { feature: 'PDF & CSV tax year reports', free: false, pro: true },
  { feature: 'Receipt image storage (5 years)', free: false, pro: true },
  { feature: 'Self Assessment deadline reminders', free: false, pro: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-[#1B4332] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">QuidWise</span>
            <span className="bg-[#95D5B2] text-[#1B4332] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
              Pro
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white/80 hover:text-white font-medium">
              Log in
            </Link>
            <Link href="/signup" className="bg-white text-[#1B4332] px-5 py-2 rounded-xl font-semibold hover:bg-[#95D5B2] transition-all">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-[#1B4332] mb-4">
          Choose Your Plan
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          The free guide helps you understand what you can claim.
          QuidWise Pro helps you actually track it, scan receipts, and generate your tax return numbers.
        </p>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-[#1B4332] mb-1">Free Guide</h3>
            <p className="text-gray-500 text-sm mb-4">
              Learn what you can claim
            </p>
            <div className="text-3xl font-bold text-[#1B4332] mb-6">
              £0<span className="text-lg font-normal text-gray-500">/forever</span>
            </div>
            <Link
              href="https://www.quidwise.co.uk/expenses.html"
              className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 w-full block text-center mb-6"
            >
              View Free Guide
            </Link>
            <ul className="space-y-2">
              {comparisonRows.filter(r => r.free).map((row) => (
                <li key={row.feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="text-[#52B788] shrink-0" size={16} />
                  {row.feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative border-2 border-[#1B4332]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#1B4332] text-white text-xs font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#1B4332] mb-1">QuidWise Pro</h3>
            <p className="text-gray-500 text-sm mb-4">
              Track, scan & export everything
            </p>
            <div className="text-3xl font-bold text-[#1B4332] mb-6">
              £5<span className="text-lg font-normal text-gray-500">/month</span>
            </div>
            <Link
              href="/signup"
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full block text-center mb-6 flex items-center justify-center gap-2"
            >
              Start 14-Day Free Trial
              <ArrowRight size={18} />
            </Link>
            <p className="text-center text-gray-400 text-xs mb-4">No bg-white rounded-2xl shadow-sm border border-gray-100 p-6 required</p>
            <ul className="space-y-2">
              {comparisonRows.map((row) => (
                <li key={row.feature} className="flex items-center gap-2 text-sm text-gray-600">
                  {row.pro ? (
                    <Check className="text-[#52B788] shrink-0" size={16} />
                  ) : (
                    <X className="text-gray-300 shrink-0" size={16} />
                  )}
                  {row.feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#1B4332] mb-1">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes — cancel through your account settings and you won&apos;t be charged again.
                You keep access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1B4332] mb-1">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600 text-sm">
                Your data is kept in read-only mode. HMRC requires 5 years of records,
                so we never delete your expense data. You can export everything anytime.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1B4332] mb-1">
                Is this an accounting tool?
              </h3>
              <p className="text-gray-600 text-sm">
                QuidWise Pro tracks your allowable expenses and maps them to HMRC categories.
                It&apos;s not full accounting software — it&apos;s focused on making your Self Assessment easy.
                Your accountant will love the clean exports.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1B4332] mb-1">
                What AI features are included?
              </h3>
              <p className="text-gray-600 text-sm">
                AI receipt scanning extracts amounts, dates, and merchants from photos.
                The &ldquo;Can I claim this?&rdquo; feature answers categorisation questions.
                Both are capped monthly but manual entry is always unlimited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

