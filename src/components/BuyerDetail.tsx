import React, { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Package, Phone, Mail, DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Buyer, Supplier } from '../types';
import { getPricePrediction, getLLMPriceExplanation, getComplianceCheck, fetchGivvableCertifications } from '../utils/marketData';

interface BuyerDetailProps {
  buyer: Buyer;
  suppliers: Supplier[];
  onBack: () => void;
  onViewSupplier: (id: string) => void;
}

interface FruitPrediction {
  current: number;
  predicted: number;
  history: { date: string; price: number }[];
  forecast: { month: string; price: number }[];
  explanation: string;
  loading: boolean;
}

export const BuyerDetail: React.FC<BuyerDetailProps> = ({
  buyer,
  suppliers,
  onBack,
  onViewSupplier
}) => {
  const matchedSuppliers = useMemo(() => {
    return Array.isArray(suppliers) ? suppliers.filter(supplier => 
      Array.isArray(supplier.fruitsOffered) && Array.isArray(buyer.fruitsInterested) &&
      supplier.fruitsOffered.some(fruit => 
        buyer.fruitsInterested.includes(fruit)
      )
    ) : [];
  }, [buyer, suppliers]);

  const [fruitPredictions, setFruitPredictions] = useState<Record<string, FruitPrediction>>({});
  const [compliance, setCompliance] = useState<string>('');
  const [givvable, setGivvable] = useState<{ categories: string[]; credentialCount: number } | null>(null);

  useEffect(() => {
    if (!Array.isArray(buyer.fruitsInterested)) return;
    buyer.fruitsInterested.forEach(async (fruit) => {
      setFruitPredictions(prev => ({
        ...prev,
        [fruit]: { ...(prev[fruit] || {}), loading: true } as FruitPrediction
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
      name: buyer.name,
      country: buyer.country,
      fruitsOffered: buyer.fruitsInterested,
      certifications: buyer.certifications || []
    }).then(setCompliance);
    fetchGivvableCertifications({ name: buyer.name }).then(res => setGivvable(res));
  }, [buyer]);

  const tradeRiskLevel = useMemo(() => {
    const avgReliability = matchedSuppliers.length > 0 ? matchedSuppliers.reduce((sum, supplier) => sum + (supplier.reliability ?? 0), 0) / matchedSuppliers.length : 0;
    if (avgReliability > 90) return { level: 'Low', color: 'green' };
    if (avgReliability > 75) return { level: 'Medium', color: 'yellow' };
    return { level: 'High', color: 'red' };
  }, [matchedSuppliers]);

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
                <h1 className="text-3xl font-bold text-gray-900">{buyer.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="w-5 h-5" />
                  {buyer.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                <span className="text-lg font-semibold">{buyer.volume} Volume</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{buyer.description ?? ''}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{buyer.contactPhone ?? 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{buyer.contactEmail ?? 'N/A'}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Fruits Interested</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(buyer.fruitsInterested) ? buyer.fruitsInterested.map(fruit => (
                  <span key={fruit} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {fruit}
                  </span>
                )) : null}
              </div>
            </div>
            {/* Certifications List */}
            {Array.isArray(buyer.certifications) && buyer.certifications.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {buyer.certifications.map(cert => (
                    <span key={cert} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  ) : 'No credentials found for this buyer on Givvable.'
                )}
              </div>
            </div>
          </div>

          {/* Price Predictions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Cost Predictions
            </h2>
            {/* Loading indicator for any fruit prediction loading */}
            {Array.isArray(buyer.fruitsInterested) && buyer.fruitsInterested.some(fruit => fruitPredictions[fruit]?.loading) && (
              <div className="flex items-center gap-2 text-blue-500 animate-pulse mb-4">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span>Loading price predictions...</span>
              </div>
            )}
            <div className="space-y-8">
              {Array.isArray(buyer.fruitsInterested) && buyer.fruitsInterested.map(fruit => {
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
                        <span className="text-sm text-gray-600">Predicted Cost</span>
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
                            {prediction.history.map((h) => (
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
                            {prediction.forecast.map((f) => (
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

          {/* Trade Risk Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Trade Risk Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-semibold">Overall Risk Level</div>
                  <div className="text-sm text-gray-600">Based on supplier reliability and market conditions</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tradeRiskLevel.color === 'green' ? 'bg-green-100 text-green-800' :
                  tradeRiskLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tradeRiskLevel.level} Risk
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-semibold mb-2">Supplier Reliability</div>
                  <div className="text-2xl font-bold text-green-600">
                    {matchedSuppliers.length > 0 ? 
                      `${Math.round(matchedSuppliers.reduce((sum, s) => sum + (s.reliability ?? 0), 0) / matchedSuppliers.length)}%` : 
                      'N/A'
                    }
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-semibold mb-2">Available Suppliers</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {matchedSuppliers.length}
                  </div>
                </div>
              </div>
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
                <div className="font-semibold">{buyer.established ?? 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Years in Business</span>
                <div className="font-semibold">{new Date().getFullYear() - (buyer.established ?? 0)} years</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Purchase Volume</span>
                <div className="font-semibold">{buyer.volume ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Matched Suppliers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Matched Suppliers ({matchedSuppliers.length})
            </h3>
            <div className="space-y-3">
              {matchedSuppliers.slice(0, 5).map(supplier => (
                <div
                  key={supplier.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => onViewSupplier(supplier.id)}
                  tabIndex={0}
                  role="button"
                  onKeyPress={e => { if (e.key === 'Enter') onViewSupplier(supplier.id); }}
                >
                  <div className="font-medium">{supplier.name ?? 'N/A'}</div>
                  <div className="text-sm text-gray-600">{supplier.location ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">
                    Offers: {supplier.fruitsOffered.filter(fruit => 
                      Array.isArray(buyer.fruitsInterested) && buyer.fruitsInterested.includes(fruit)
                    ).join(', ') ?? 'N/A'}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {supplier.reliability ?? 'N/A'}% reliable
                  </div>
                </div>
              ))}
              {matchedSuppliers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No matched suppliers found
                </div>
              )}
            </div>
          </div>

          {/* Budget Ranges */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Ranges
            </h3>
            <div className="space-y-3">
              {Object.entries(buyer.budgetRange ?? {}).map(([fruit, range]) => (
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