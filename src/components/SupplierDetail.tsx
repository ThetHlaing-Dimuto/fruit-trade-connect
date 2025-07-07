import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, Shield, Phone, Mail, DollarSign, Users } from 'lucide-react';
import { Supplier, Buyer } from '../types';
import { getPricePrediction, getLLMPriceExplanation, getComplianceCheck, fetchGivvableCertifications } from '../utils/marketData';

interface SupplierDetailProps {
  supplier: Supplier;
  buyers: Buyer[];
  onBack: () => void;
  onViewBuyer: (id: string) => void;
}

// Add FruitPrediction type (copy from BuyerDetail or define here)
type FruitPrediction = {
  current?: number;
  predicted?: number;
  history?: { date: string; price: number }[];
  forecast?: { month: string; price: number }[];
  explanation?: string;
  loading?: boolean;
};

export const SupplierDetail: React.FC<SupplierDetailProps> = ({
  supplier,
  buyers,
  onBack,
  onViewBuyer
}) => {
  const matchedBuyers = useMemo(() => {
    return Array.isArray(buyers) ? buyers.filter(buyer => 
      Array.isArray(buyer.fruitsInterested) && Array.isArray(supplier.fruitsOffered) &&
      buyer.fruitsInterested.some(fruit => 
        supplier.fruitsOffered.includes(fruit)
      )
    ) : [];
  }, [supplier, buyers]);

  // --- ADDED: State for async data ---
  const [fruitPredictions, setFruitPredictions] = useState<Record<string, FruitPrediction>>({});
  const [compliance, setCompliance] = useState<string>('');
  const [givvable, setGivvable] = useState<{ categories: string[]; credentialCount: number } | null>(null);

  useEffect(() => {
    if (!Array.isArray(supplier.fruitsOffered)) return;
    supplier.fruitsOffered.forEach(async (fruit) => {
      setFruitPredictions(prev => ({
        ...prev,
        [fruit]: { ...(prev[fruit] || {}), loading: true }
      }));
      const { current, predicted, history, forecast } = await getPricePrediction(fruit);
      const explanation = await getLLMPriceExplanation({
        fruit,
        history,
        predicted
      });
      setFruitPredictions(prev => ({
        ...prev,
        [fruit]: { current, predicted, history, forecast, explanation, loading: false }
      }));
    });
    getComplianceCheck({
      name: supplier.name,
      country: supplier.country || supplier.location || '',
      fruitsOffered: supplier.fruitsOffered || [],
      certifications: supplier.certifications || []
    }).then(setCompliance);
    fetchGivvableCertifications({ name: supplier.name }).then(res => setGivvable(res));
  }, [supplier]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="w-5 h-5" />
                  {supplier.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{supplier.reliability}%</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{supplier.description ?? ''}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{supplier.contactPhone ?? 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{supplier.contactEmail ?? 'N/A'}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Fruits Offered</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(supplier.fruitsOffered) ? supplier.fruitsOffered.map(fruit => (
                  <span key={fruit} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {fruit}
                  </span>
                )) : null}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(supplier.certifications) ? supplier.certifications.map(cert => (
                  <span key={cert} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {cert}
                  </span>
                )) : null}
              </div>
            </div>

            {/* Compliance Check Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Compliance Check (AI)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800 min-h-[48px]">
                {compliance ? compliance : 'Checking compliance...'}
              </div>
            </div>
            {/* Live Certification Lookup (Givvable) Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Live Certification Lookup (Givvable)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800 min-h-[48px]">
                {givvable === null ? 'Checking Givvable...' : (
                  givvable.credentialCount > 0 ? (
                    <div>
                      <div><span className="font-medium">Credential Categories:</span> {givvable.categories.join(', ')}</div>
                      <div><span className="font-medium">Total Credentials:</span> {givvable.credentialCount}</div>
                    </div>
                  ) : 'No credentials found for this supplier on Givvable.'
                )}
              </div>
            </div>
          </div>

          {/* Price Predictions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 15V7a4 4 0 018 0v8" /></svg>
              Price Predictions
            </h2>
            {/* Loading indicator for any fruit prediction loading */}
            {Array.isArray(supplier.fruitsOffered) && supplier.fruitsOffered.some(fruit => fruitPredictions[fruit]?.loading) && (
              <div className="flex items-center gap-2 text-blue-500 animate-pulse mb-4">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span>Loading price predictions...</span>
              </div>
            )}
            <div className="space-y-8">
              {Array.isArray(supplier.fruitsOffered) && supplier.fruitsOffered.map((fruit: string) => {
                const prediction = fruitPredictions[fruit];
                if (!prediction) return (
                  <div key={fruit} className="text-gray-400">Loading prediction for {fruit}...</div>
                );
                return (
                  <div key={fruit} className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{fruit}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="text-sm text-gray-600">Current Market Price</span>
                        <div className="text-lg font-semibold">
                          ${typeof prediction.current === 'number' ? prediction.current.toFixed(2) : '_'} USD per kg
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Predicted Price</span>
                        <div className="text-lg font-semibold">
                          ${typeof prediction.predicted === 'number' ? prediction.predicted.toFixed(2) : '_'} USD per kg
                        </div>
                      </div>
                    </div>
                    {/* Price History Table */}
                    {Array.isArray(prediction.history) && prediction.history.length > 0 && (
                      <div className="mb-2">
                        <div className="font-medium mb-1">Price History</div>
                        <table className="min-w-full text-sm border">
                          <thead>
                            <tr>
                              <th className="border px-2 py-1">Date</th>
                              <th className="border px-2 py-1">Price (USD)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prediction.history.map((h: { date: string; price: number }) => (
                              <tr key={h.date}>
                                <td className="border px-2 py-1">{h.date}</td>
                                <td className="border px-2 py-1">${h.price.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Forecast Table */}
                    {Array.isArray(prediction.forecast) && prediction.forecast.length > 0 && (
                      <div className="mb-2">
                        <div className="font-medium mb-1">Predicted Price (Next 6 Months)</div>
                        <table className="min-w-full text-sm border">
                          <thead>
                            <tr>
                              <th className="border px-2 py-1">Month</th>
                              <th className="border px-2 py-1">Predicted Price (USD)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prediction.forecast.map((f: { month: string; price: number }) => (
                              <tr key={f.month}>
                                <td className="border px-2 py-1">{f.month}</td>
                                <td className="border px-2 py-1">${f.price.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* LLM Explanation */}
                    {prediction.explanation && (
                      <div className="text-sm text-blue-700 mt-2">
                        <span className="font-medium">AI Explanation:</span> {prediction.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4">Company Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Established</span>
                <div className="font-semibold">{supplier.established}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Years in Business</span>
                <div className="font-semibold">{new Date().getFullYear() - supplier.established} years</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Reliability Score</span>
                <div className="font-semibold">{supplier.reliability}%</div>
              </div>
            </div>
          </div>

          {/* Matched Buyers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Matched Buyers ({matchedBuyers.length})
            </h3>
            <div className="space-y-3">
              {matchedBuyers.slice(0, 5).map((buyer: Buyer) => (
                <div
                  key={buyer.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => onViewBuyer(buyer.id)}
                  tabIndex={0}
                  role="button"
                  onKeyPress={e => { if (e.key === 'Enter') onViewBuyer(buyer.id); }}
                >
                  <div className="font-medium">{buyer.name}</div>
                  <div className="text-sm text-gray-600">{buyer.location}</div>
                  <div className="text-sm text-gray-500">
                    Interested in: {buyer.fruitsInterested.filter((fruit: string) => 
                      supplier.fruitsOffered.includes(fruit)
                    ).join(', ')}
                  </div>
                </div>
              ))}
              {matchedBuyers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No matched buyers found
                </div>
              )}
            </div>
          </div>

          {/* Price Ranges */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Price Ranges
            </h3>
            <div className="space-y-3">
              {Object.entries(supplier.priceRange ?? {}).map(([fruit, range]) => (
                <div key={fruit} className="flex justify-between items-center">
                  <span className="capitalize text-sm">{fruit}</span>
                  <span className="font-medium text-sm">
                    ${range.min ?? 'N/A'}-{range.max ?? 'N/A'} {range.currency ?? ''} per {range.unit ?? 'kg'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};