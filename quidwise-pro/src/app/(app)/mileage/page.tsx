'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { getCurrentTaxYear, getMileageRate } from '@/lib/tax-year';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  RouteIcon,
  Plus,
  Save,
  Trash2,
  Star,
  ArrowLeftRight,
  Car,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import type { MileageEntry, SavedRoute } from '@/types';

export default function MileagePage() {
  const [activeTab, setActiveTab] = useState<'log' | 'routes'>('log');
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [miles, setMiles] = useState('');
  const [isReturn, setIsReturn] = useState(false);
  const [purpose, setPurpose] = useState('');

  // Saved route form
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routeMiles, setRouteMiles] = useState('');
  const [routeReturn, setRouteReturn] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const taxYear = getCurrentTaxYear();

    const { data: mileageData } = await supabase
      .from('mileage')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', taxYear.start.toISOString().split('T')[0])
      .lte('date', taxYear.end.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: routesData } = await supabase
      .from('saved_routes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (mileageData) setEntries(mileageData);
    if (routesData) setSavedRoutes(routesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalMiles = entries.reduce((sum, e) => sum + Number(e.miles) * (e.is_return_trip ? 2 : 1), 0);
  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const milesAt45p = Math.min(totalMiles, 10000);
  const milesAt25p = Math.max(0, totalMiles - 10000);
  const currentRate = getMileageRate(totalMiles);

  const handleLogTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLoc || !toLoc || !miles || !purpose) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const actualMiles = Number(miles) * (isReturn ? 2 : 1);
    const rate = getMileageRate(totalMiles + actualMiles);

    const { error } = await supabase.from('mileage').insert({
      user_id: user.id,
      date: tripDate,
      from_location: fromLoc,
      to_location: toLoc,
      miles: Number(miles),
      is_return_trip: isReturn,
      purpose,
      rate_pence: rate,
    });

    if (error) {
      setToast({ message: 'Failed to log trip', type: 'error' });
    } else {
      setToast({ message: 'Trip logged!', type: 'success' });
      setFromLoc('');
      setToLoc('');
      setMiles('');
      setPurpose('');
      setIsReturn(false);
      loadData();
    }
    setSaving(false);
  };

  const handleSaveRoute = async () => {
    if (!routeName || !routeFrom || !routeTo || !routeMiles) {
      setToast({ message: 'Please fill in all route fields', type: 'error' });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('saved_routes').insert({
      user_id: user.id,
      name: routeName,
      from_location: routeFrom,
      to_location: routeTo,
      miles: Number(routeMiles),
      is_return: routeReturn,
    });

    setShowRouteForm(false);
    setRouteName('');
    setRouteFrom('');
    setRouteTo('');
    setRouteMiles('');
    setToast({ message: 'Route saved!', type: 'success' });
    loadData();
  };

  const useRoute = (route: SavedRoute) => {
    setFromLoc(route.from_location);
    setToLoc(route.to_location);
    setMiles(String(route.miles));
    setIsReturn(route.is_return);
    setActiveTab('log');
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this trip?')) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from('mileage').delete().eq('id', id);
    setToast({ message: 'Trip deleted', type: 'success' });
    loadData();
  };

  const deleteRoute = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from('saved_routes').delete().eq('id', id);
    setToast({ message: 'Route deleted', type: 'success' });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl lg:text-3xl font-bold text-[#1B4332] mb-6">
        Mileage Tracker
      </h1>

      {/* Running totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Total Miles</span>
          <span className="text-3xl font-bold text-[#1B4332]">{totalMiles.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Total Claim</span>
          <span className="text-3xl font-bold text-[#1B4332] text-[#52B788]">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Miles @ 45p</span>
          <span className="text-3xl font-bold text-[#1B4332] text-lg">{milesAt45p.toLocaleString()} / 10,000</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Current Rate</span>
          <span className="text-3xl font-bold text-[#1B4332] text-lg">{currentRate}p/mile</span>
          {milesAt25p > 0 && (
            <span className="text-xs text-gray-400">
              {milesAt25p.toLocaleString()} miles @ 25p
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 max-w-xs">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'log'
              ? 'bg-white text-[#1B4332] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Log Trip
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'routes'
              ? 'bg-white text-[#1B4332] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved Routes
        </button>
      </div>

      {activeTab === 'log' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trip form */}
          <form onSubmit={handleLogTrip} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1B4332]">Log a Trip</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From</label>
              <input
                type="text"
                value={fromLoc}
                onChange={(e) => setFromLoc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                placeholder="e.g. Home office"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">To</label>
              <input
                type="text"
                value={toLoc}
                onChange={(e) => setToLoc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                placeholder="e.g. Client office, London"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance (miles, one way)</label>
              <input
                type="number"
                step="0.1"
                value={miles}
                onChange={(e) => setMiles(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                placeholder="0.0"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Return trip?</span>
              </div>
              <button
                type="button"
                onClick={() => setIsReturn(!isReturn)}
                className={`w-12 h-6 rounded-full transition-all ${
                  isReturn ? 'bg-[#1B4332]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isReturn ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {miles && (
              <div className="bg-[#95D5B2]/10 p-3 rounded-xl">
                <div className="text-sm text-[#1B4332]">
                  <strong>
                    {(Number(miles) * (isReturn ? 2 : 1)).toFixed(1)} miles
                  </strong>{' '}
                  @ {currentRate}p ={' '}
                  <strong>
                    {formatCurrency(
                      (Number(miles) * (isReturn ? 2 : 1) * currentRate) / 100
                    )}
                  </strong>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                placeholder="e.g. Meeting with Client X"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md w-full flex items-center justify-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : (
                <>
                  <Save size={18} />
                  Log Trip
                </>
              )}
            </button>
          </form>

          {/* Recent trips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#1B4332] mb-4">
              Recent Trips
            </h2>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Car size={36} className="mx-auto mb-3 opacity-50" />
                <p>No trips logged yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {entry.from_location} → {entry.to_location}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(entry.date)} · {Number(entry.miles)} mi{entry.is_return_trip ? ' (return)' : ''} · {entry.purpose}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#1B4332] text-sm">
                        {formatCurrency(Number(entry.amount))}
                      </span>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-300 hover:text-[#E76F51]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1B4332]">Saved Routes</h2>
            <button
              onClick={() => setShowRouteForm(!showRouteForm)}
              className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-2 !px-4 !py-2"
            >
              <Plus size={16} />
              Add Route
            </button>
          </div>

          {showRouteForm && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                placeholder="Route name (e.g. Home to Client A)"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={routeFrom}
                  onChange={(e) => setRouteFrom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="From"
                />
                <input
                  type="text"
                  value={routeTo}
                  onChange={(e) => setRouteTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="To"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={routeMiles}
                  onChange={(e) => setRouteMiles(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all duration-200 text-gray-900"
                  placeholder="Miles"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={routeReturn}
                    onChange={(e) => setRouteReturn(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Return trip</span>
                </div>
              </div>
              <button onClick={handleSaveRoute} className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-all duration-200 shadow-sm hover:shadow-md text-sm">
                Save Route
              </button>
            </div>
          )}

          {savedRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star size={36} className="mx-auto mb-3 opacity-50" />
              <p>No saved routes yet</p>
              <p className="text-sm mt-1">Save your common routes for quick mileage logging</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {route.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {route.from_location} → {route.to_location} · {Number(route.miles)} mi
                      {route.is_return ? ' (return)' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => useRoute(route)}
                      className="text-sm text-[#1B4332] font-medium hover:underline flex items-center gap-1"
                    >
                      <RouteIcon size={14} />
                      Use
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="text-gray-300 hover:text-[#E76F51]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

