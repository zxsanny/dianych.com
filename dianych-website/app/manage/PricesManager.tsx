'use client';

import { useEffect, useState } from 'react';

type Prices = {
  smallFrame8: number;
  smallFrame10: number;
  mediumFrame14: number;
  largeFrame19: number;
};

const DEFAULTS: Prices = {
  smallFrame8: 450,
  smallFrame10: 500,
  mediumFrame14: 600,
  largeFrame19: 700,
};

export default function PricesManager() {
  const [prices, setPrices] = useState<Prices>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/prices', { cache: 'no-store' });
        if (!res.ok) {
          // Handle non-OK without throwing to avoid local throw/catch warning
          console.error('Error loading prices: response not ok', res.status);
          if (active) setError('Не вдалося завантажити ціни. Показані значення за замовчуванням.');
          return;
        }
        const data = await res.json();
        if (active) setPrices((p) => ({ ...p, ...data }));
      } catch (e) {
          console.error('Error loading prices:', e);
          setError('Не вдалося завантажити ціни. Показані значення за замовчуванням.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(key: keyof Prices, value: string) {
    // Allow only digits
    const sanitized = value.replace(/[^0-9.]/g, '');
    const num = sanitized === '' ? NaN : Number(sanitized);
    setPrices((prev) => ({ ...prev, [key]: Number.isFinite(num) ? num : (prev[key] ?? 0) }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        // Avoid throwing locally; set error state and exit
        setError((data as any).message || 'Помилка збереження');
        return;
      }
      const data = await res.json();
      setPrices(data);
      setMessage('Ціни успішно збережено.');
    } catch (e: any) {
      setError(e?.message || 'Не вдалося зберегти ціни.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-2 color-red">Керування цінами рамок</h2>
      <p className="text-center text-gray-500 mb-6">Оновіть ціни і натисніть "Зберегти".</p>

      {loading ? (
        <p className="text-center text-gray-500">Завантаження...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мала рамка 8 см</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full p-2 border border-gray-300 rounded color-red"
              value={prices.smallFrame8}
              onChange={(e) => handleChange('smallFrame8', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мала рамка 10 см</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full p-2 border border-gray-300 rounded color-red"
              value={prices.smallFrame10}
              onChange={(e) => handleChange('smallFrame10', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Середня рамка 14 см</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full p-2 border border-gray-300 rounded color-red"
              value={prices.mediumFrame14}
              onChange={(e) => handleChange('mediumFrame14', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Велика рамка 19 см</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full p-2 border border-gray-300 rounded color-red"
              value={prices.largeFrame19}
              onChange={(e) => handleChange('largeFrame19', e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-center text-red-600 text-sm">{error}</p>}
      {message && <p className="text-center text-green-600 text-sm">{message}</p>}

      <div className="flex justify-center pt-4">
        <button
          onClick={save}
          disabled={saving || loading}
          className="px-6 py-3 bg-[#E11D48] text-white font-semibold rounded-lg hover:bg-pink-700 disabled:bg-gray-400"
        >
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>
    </div>
  );
}
