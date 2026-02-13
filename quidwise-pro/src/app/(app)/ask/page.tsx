'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryById } from '@/lib/expense-categories';
import {
  MessageCircleQuestion,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import type { CategoriseResult } from '@/types';

const QUICK_ASKS = [
  'Gym membership',
  'Client lunch',
  'Home office desk',
  'Train fare to client',
  'Accountant fees',
  'New laptop',
  'Phone bill',
  'Work clothes',
];

export default function AskPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CategoriseResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [questionsLimit, setQuestionsLimit] = useState(15);

  useEffect(() => {
    fetch('/api/ai/usage')
      .then((r) => r.json())
      .then((data) => {
        setQuestionsUsed(data.queries_used || 0);
        setQuestionsLimit(data.queries_limit || 15);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setToast({ message: data.message, type: 'error' });
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Failed');

      const data: CategoriseResult = await res.json();
      setResult(data);
      setQuestionsUsed((prev) => prev + 1);
    } catch {
      setToast({ message: 'Failed to check. Please try again.', type: 'error' });
    }

    setLoading(false);
  };

  const handleQuickAsk = (q: string) => {
    setQuestion(q);
    setResult(null);
  };

  const getResultIcon = () => {
    if (!result) return null;
    if (result.claimable === true) return <CheckCircle className="text-[#52B788]" size={28} />;
    if (result.claimable === false) return <XCircle className="text-[#E76F51]" size={28} />;
    return <AlertTriangle className="text-[#F4A261]" size={28} />;
  };

  const getResultLabel = () => {
    if (!result) return '';
    if (result.claimable === true) return 'Claimable';
    if (result.claimable === false) return 'Not Claimable';
    return 'Partially Claimable';
  };

  const getResultBg = () => {
    if (!result) return '';
    if (result.claimable === true) return 'bg-[#95D5B2]/10 border-[#95D5B2]/30';
    if (result.claimable === false) return 'bg-[#E76F51]/5 border-[#E76F51]/20';
    return 'bg-[#F4A261]/10 border-[#F4A261]/30';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332]">
            Can I Claim This?
          </h1>
          <p className="text-gray-500 mt-1">
            Describe an expense and we&apos;ll check if it&apos;s claimable
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Zap size={14} />
          {questionsLimit - questionsUsed} left
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1.5">
          Describe the expense you&apos;re wondering about
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900 text-lg"
          rows={3}
          placeholder="e.g. I bought a new desk for my home office"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full mt-4 flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : (
            <>
              <MessageCircleQuestion size={18} />
              Check if Claimable
            </>
          )}
        </button>
      </form>

      {/* Quick ask chips */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">
          Common questions
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ASKS.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickAsk(q)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#1B4332] hover:text-[#1B4332] transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-2 ${getResultBg()} animate-slide-up`}>
          <div className="flex items-center gap-3 mb-4">
            {getResultIcon()}
            <h2 className="text-xl font-bold text-[#1B4332]">
              {getResultLabel()}
            </h2>
          </div>

          <p className="text-gray-700 mb-4">{result.answer}</p>

          {result.category_id && result.category_id !== 'not-claimable' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#95D5B2]/30 text-[#1B4332]">
                {getCategoryById(result.category_id)?.hmrcCategory || result.category_id}
              </span>
              {result.hmrc_box && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{result.hmrc_box}</span>
              )}
            </div>
          )}

          {(result.claimable === true || result.claimable === 'partial') && (
            <button
              onClick={() => router.push(`/expenses/new?category=${result.category_id}`)}
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-2"
            >
              Add this as an expense
              <ArrowRight size={16} />
            </button>
          )}

          <p className="text-xs text-gray-400 mt-4 italic">
            This is general guidance based on HMRC rules. For advice specific to
            your situation, consult a qualified accountant.
          </p>
        </div>
      )}
    </div>
  );
}

