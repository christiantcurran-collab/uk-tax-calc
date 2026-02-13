'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { EXPENSE_CATEGORIES, getHmrcBox } from '@/lib/expense-categories';
import {
  Camera,
  Upload,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import type { ReceiptScanResult } from '@/types';

type ScanStep = 'capture' | 'processing' | 'review' | 'done';

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<ScanStep>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Editable fields from scan
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [businessProportion, setBusinessProportion] = useState(100);
  const [notes, setNotes] = useState('');

  const resizeImage = (file: File): Promise<{ base64: string; mime: string; preview: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (h * maxWidth) / w;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mime: 'image/jpeg', preview: dataUrl });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    const { base64, mime, preview } = await resizeImage(file);
    setImagePreview(preview);
    setImageBase64(base64);
    setMimeType(mime);
    await processImage(base64, mime);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setToast({ message: 'Could not access camera. Try uploading instead.', type: 'error' });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);

    setImagePreview(dataUrl);
    setImageBase64(base64);
    setMimeType('image/jpeg');
    processImage(base64, 'image/jpeg');
  };

  const processImage = async (base64: string, mime: string) => {
    setStep('processing');

    try {
      const res = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setToast({ message: data.message, type: 'error' });
        router.push('/expenses/new');
        return;
      }

      if (!res.ok) throw new Error('Scan failed');

      const result: ReceiptScanResult = await res.json();
      setScanResult(result);

      // Pre-fill fields
      setAmount(result.total_amount ? String(result.total_amount) : '');
      setDate(result.date || new Date().toISOString().split('T')[0]);
      setMerchant(result.merchant || '');
      setCategoryId(result.suggested_category || '');
      setDescription(
        result.items?.map((i) => i.description).join(', ') || ''
      );

      setStep('review');
    } catch {
      setToast({ message: 'Failed to scan receipt. Try again or add manually.', type: 'error' });
      setStep('capture');
    }
  };

  const handleSave = async () => {
    if (!amount || !date || !categoryId) {
      setToast({ message: 'Please fill in amount, date, and category', type: 'error' });
      return;
    }

    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upload receipt image
    let receiptPath = null;
    if (imageBase64) {
      const blob = await fetch(`data:${mimeType};base64,${imageBase64}`).then(r => r.blob());
      const filePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, blob);
      if (!uploadError) receiptPath = filePath;
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      date,
      merchant: merchant || null,
      description: description || null,
      category_id: categoryId,
      hmrc_box: getHmrcBox(categoryId),
      is_partial_claim: isPartial,
      business_proportion: isPartial ? businessProportion : 100,
      entry_method: 'ai_scan',
      notes: notes || null,
      receipt_image_path: receiptPath,
      ai_extracted_data: scanResult,
    });

    if (error) {
      setToast({ message: 'Failed to save expense', type: 'error' });
      setSaving(false);
      return;
    }

    setStep('done');
    setSaving(false);
  };

  const resetScan = () => {
    setStep('capture');
    setImagePreview(null);
    setImageBase64('');
    setScanResult(null);
    setAmount('');
    setDate('');
    setMerchant('');
    setCategoryId('');
    setDescription('');
    setNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332] mb-6">
        Scan Receipt
      </h1>

      {/* Step 1: Capture */}
      {step === 'capture' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {cameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <div className="absolute inset-0 border-2 border-white/50 rounded-xl m-4 pointer-events-none" />
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={capturePhoto} className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
                  <Camera size={20} />
                  Take Photo
                </button>
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach((t) => t.stop());
                    setCameraActive(false);
                  }}
                  className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1B4332] hover:bg-gray-50 cursor-pointer transition-all"
              >
                <Upload size={40} className="text-gray-400" />
                <div className="text-center">
                  <p className="font-medium text-gray-700">
                    Upload a receipt photo
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>

              <button
                onClick={startCamera}
                className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 w-full flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Open Camera
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 'processing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center py-12">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Receipt"
              className="w-48 h-auto mx-auto rounded-xl mb-6 opacity-75"
            />
          )}
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4 font-medium">Extracting data from receipt...</p>
          <p className="text-gray-400 text-sm mt-1">
            This usually takes 2-3 seconds
          </p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && scanResult && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Receipt preview */}
          <div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Receipt"
                className="w-full rounded-xl shadow-sm"
              />
            )}
          </div>

          {/* Extracted data form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {scanResult.confidence < 0.5 && (
              <div className="flex items-start gap-2 bg-[#E76F51]/10 text-[#E76F51] p-3 rounded-xl text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>
                  We couldn&apos;t read this receipt clearly. Please check all fields.
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (£)
                {scanResult.confidence < 0.8 && amount && (
                  <span className="text-[#F4A261] text-xs ml-2">⚠ low confidence</span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900 text-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Merchant</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                required
              >
                <option value="">Select a category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {scanResult.suggested_category === categoryId && (
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles size={12} className="text-[#52B788]" />
                  <span className="text-xs text-[#52B788] font-medium">
                    AI suggested — {scanResult.category_reasoning}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                rows={2}
              />
            </div>

            {/* Partial claim toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Partly personal?
              </span>
              <button
                type="button"
                onClick={() => setIsPartial(!isPartial)}
                className={`w-12 h-6 rounded-full transition-all ${
                  isPartial ? 'bg-[#1B4332]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    isPartial ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {isPartial && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business proportion: {businessProportion}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={businessProportion}
                  onChange={(e) => setBusinessProportion(Number(e.target.value))}
                  className="w-full accent-[#1B4332]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md flex-1 flex items-center justify-center gap-2"
              >
                {saving ? <LoadingSpinner size="sm" /> : (
                  <>
                    <Save size={18} />
                    Save Expense
                  </>
                )}
              </button>
              <button onClick={resetScan} className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200 !px-4">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center py-12">
          <div className="w-16 h-16 bg-[#95D5B2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-[#52B788]" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1B4332] mb-2">
            Expense Saved!
          </h2>
          <p className="text-gray-500 mb-6">
            £{parseFloat(amount).toFixed(2)} in{' '}
            {EXPENSE_CATEGORIES.find((c) => c.id === categoryId)?.name}
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={resetScan} className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md">
              Scan Another
            </button>
            <button
              onClick={() => router.push('/expenses')}
              className="bg-white text-[#1B4332] border-2 border-[#1B4332] px-6 py-3 rounded-xl font-semibold hover:bg-[#1B4332] hover:text-white transition-all duration-200"
            >
              View All Expenses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

