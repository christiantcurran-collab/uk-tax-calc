import Link from 'next/link';
import { Camera, FileBarChart, MessageCircleQuestion, Check, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI Receipt Scanner',
    description: 'Snap a photo. We extract the amount, date, and category automatically using AI.',
  },
  {
    icon: FileBarChart,
    title: 'HMRC-Ready Reports',
    description: 'Your expenses, mapped to SA103 categories. Ready for your Self Assessment tax return.',
  },
  {
    icon: MessageCircleQuestion,
    title: '"Can I Claim This?"',
    description: "Not sure if an expense is claimable? Ask our AI and get an instant answer with HMRC guidance.",
  },
];

const benefits = [
  'Unlimited manual expense entry',
  'Up to 50 AI receipt scans/month',
  'Up to 15 "Can I claim this?" questions/month',
  'Mileage tracker with saved routes',
  'HMRC SA103 category mapping',
  'PDF & CSV tax year reports',
  'Receipt image storage (5 years)',
  'Self Assessment deadline reminders',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-[#1B4332] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">QuidWise</span>
            <span className="bg-[#95D5B2] text-[#1B4332] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
              Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-white/80 hover:text-white font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-white text-[#1B4332] px-5 py-2 rounded-xl font-semibold hover:bg-[#95D5B2] transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1B4332] text-white pb-20 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Track Every Expense.
            <br />
            <span className="text-[#95D5B2]">Claim Every Penny.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            The expense tracker built specifically for UK freelancers. Scan receipts,
            categorise by HMRC rules, and export your tax return numbers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-[#1B4332] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#95D5B2] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-4">
            14-day free trial · No credit bg-white rounded-2xl shadow-sm border border-gray-100 p-6 required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B4332] mb-12">
            Everything you need to maximise your tax deductions
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-14 h-14 bg-[#95D5B2]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-[#1B4332]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1B4332] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white" id="pricing">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B4332] mb-12">
            Simple, transparent pricing
          </h2>
          <div className="bg-[#F4E9D8] rounded-2xl p-6 p-8 rounded-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[#1B4332]">
                £5<span className="text-xl font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600 mt-2">Cancel anytime · No contracts</p>
            </div>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <Check className="text-[#52B788] shrink-0 mt-0.5" size={18} />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full block text-center text-lg"
            >
              Start Your 14-Day Free Trial
            </Link>
            <p className="text-center text-gray-400 text-sm mt-3">
              No credit bg-white rounded-2xl shadow-sm border border-gray-100 p-6 required to start
            </p>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-lg font-semibold text-[#1B4332] mb-1">
                Making Tax Digital Ready
              </div>
              <p className="text-gray-500 text-sm">
                Built for MTD compliance from day one
              </p>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#1B4332] mb-1">
                UK Data Security
              </div>
              <p className="text-gray-500 text-sm">
                Your data is encrypted and stored securely
              </p>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#1B4332] mb-1">
                Cancel Anytime
              </div>
              <p className="text-gray-500 text-sm">
                No long-term contracts or hidden fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B4332] text-white/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} QuidWise. All rights reserved.</p>
          <p className="text-sm mt-2">
            QuidWise Pro is a product of QuidWise. Not affiliated with HMRC.
          </p>
        </div>
      </footer>
    </div>
  );
}

