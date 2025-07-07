import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Label, LabelList
} from 'recharts';
import { Supplier, Buyer } from '../types';
import { TooltipProps, LegendProps, PieLabelRenderProps } from 'recharts';
import { BuyerSupplierSankey } from './BuyerSupplierSankey';

const COLORS = [
  '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#818cf8', '#f59e42'
];
const GRADIENT_ID = 'barGradient';

// --- AI Insight Cache (module-level) ---
let lastInsightPrompt = '';
let lastInsightResult = '';
let lastInsightTimestamp = 0;
const INSIGHT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

function getCountryDistribution(suppliers: Supplier[]) {
  const map: Record<string, number> = {};
  suppliers.forEach(s => {
    map[s.country] = (map[s.country] || 0) + 1;
  });
  return Object.entries(map).map(([country, value]) => ({ name: country, value }));
}

function getBuyerFruitDistribution(buyers: Buyer[]) {
  const map: Record<string, number> = {};
  buyers.forEach(b => {
    (b.fruitsInterested || []).forEach(fruit => {
      map[fruit] = (map[fruit] || 0) + 1;
    });
  });
  return Object.entries(map).map(([fruit, value]) => ({ name: fruit, value }));
}

function getCertificationDistribution(suppliers: Supplier[]) {
  const map: Record<string, number> = {};
  suppliers.forEach(s => {
    (s.certifications || []).forEach(cert => {
      map[cert] = (map[cert] || 0) + 1;
    });
  });
  return Object.entries(map).map(([cert, value]) => ({ name: cert, value }));
}

// Define a type for the pie payload
interface PiePayload {
  name: string;
  value: number;
  percent: number;
  color?: string;
}

// Custom tooltip for Pie
const CustomPieTooltip = (props: TooltipProps<number, string>) => {
  const active = props.active;
  const payload = props.payload as Array<{ payload: PiePayload }> | undefined;
  if (active && Array.isArray(payload) && payload.length && payload[0].payload) {
    const { name, value, percent } = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-gray-200">
        <strong>{name}</strong><br />
        {value} ({(percent * 100).toFixed(1)}%)
      </div>
    );
  }
  return null;
};

// Custom legend for Pie
const CustomLegend = (props: LegendProps) => {
  const payload = props.payload as PiePayload[] | undefined;
  return (
    <ul className="flex flex-wrap gap-3 mt-2">
      {Array.isArray(payload) && payload.map((e) => {
        const color = e.color || '#888';
        return (
          <li key={`legend-${e.value}`} className="flex items-center gap-2">
            <span style={{ background: color, width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span>
            <span className="text-sm">{e.value}</span>
          </li>
        );
      })}
    </ul>
  );
};

// Custom label for Pie (centered percent)
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  // Ensure all are numbers
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number'
  ) {
    return null;
  }
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#222" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={13} fontWeight={500}>
      {name}: {(percent * 100).toFixed(0)}%
    </text>
  );
};

export const BusinessIntelligenceChart: React.FC<{ suppliers: Supplier[]; buyers: Buyer[] }> = ({ suppliers, buyers }) => {
  const countryData = getCountryDistribution(suppliers);
  const fruitData = getBuyerFruitDistribution(buyers);
  const certData = getCertificationDistribution(suppliers);

  // CEO-style summary
  const topCountry = countryData.sort((a, b) => b.value - a.value)[0]?.name;
  const topFruit = fruitData.sort((a, b) => b.value - a.value)[0]?.name;
  const topCert = certData.sort((a, b) => b.value - a.value)[0]?.name;

  // --- AI Insight State ---
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchInsight() {
      setAiLoading(true);
      const prompt = `You are a business intelligence analyst for a global fruit trading platform. Here is a summary of our current supplier and buyer data:\n\nTop supplier country: ${topCountry}\nTop buyer fruit: ${topFruit}\nTop supplier certification: ${topCert}\n\nSupplier country distribution: ${JSON.stringify(countryData)}\nBuyer fruit interest distribution: ${JSON.stringify(fruitData)}\nSupplier certification distribution: ${JSON.stringify(certData)}\n\nPlease provide a concise, actionable insight (2-4 sentences) for the CEO, highlighting any trends, risks, or opportunities you see in this data.`;
      const now = Date.now();
      if (
        prompt === lastInsightPrompt &&
        lastInsightResult &&
        now - lastInsightTimestamp < INSIGHT_CACHE_DURATION
      ) {
        setAiInsight(lastInsightResult);
        setAiLoading(false);
        return;
      }
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${apiBaseUrl}/api/vertexChat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });
        const data = await res.json();
        setAiInsight(data.content || 'No AI insight available.');
        // Update cache
        lastInsightPrompt = prompt;
        lastInsightResult = data.content || 'No AI insight available.';
        lastInsightTimestamp = Date.now();
      } catch {
        setAiInsight('AI insight not available.');
      } finally {
        setAiLoading(false);
      }
    }
    fetchInsight();
    // Only re-run if the summary changes
  }, [topCountry, topFruit, topCert, JSON.stringify(countryData), JSON.stringify(fruitData), JSON.stringify(certData)]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
      <h2 className="text-3xl font-extrabold mb-6 tracking-tight text-gray-900">Business Intelligence Dashboard</h2>
      <div className="mb-6 text-gray-700 text-lg">
        <strong>CEO Insights:</strong> <br />
        Our largest supplier base is in <span className="text-green-700 font-semibold">{topCountry || 'N/A'}</span>. <br />
        The most in-demand fruit among buyers is <span className="text-orange-700 font-semibold">{topFruit || 'N/A'}</span>. <br />
        The most common supplier certification is <span className="text-blue-700 font-semibold">{topCert || 'N/A'}</span>.
      </div>
      {/* AI Insight Section */}
      <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-400 text-blue-900 rounded-lg shadow-sm">
        <strong>AI Insight:</strong><br />
        {aiLoading ? 'Generating insight...' : aiInsight}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Suppliers by Country (Donut) */}
        <div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Suppliers by Country</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={countryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                label={renderCustomizedLabel}
                isAnimationActive={true}
                animationDuration={900}
                paddingAngle={2}
              >
                {countryData.map((entry, idx) => (
                  <Cell key={`cell-country-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Buyers by Fruit Interest (Bar) */}
        <div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Buyers by Fruit Interest</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fruitData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#f59e42" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#555' }}>
                <Label value="Fruit" offset={-8} position="insideBottom" fontSize={14} />
              </XAxis>
              <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#555' }}>
                <Label value="Number of Buyers" angle={-90} position="insideLeft" fontSize={14} />
              </YAxis>
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ fontSize: 14 }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="value" fill={`url(#${GRADIENT_ID})`} radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={900}>
                <LabelList dataKey="value" position="top" fontSize={13} fill="#222" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Supplier Certifications (Donut) */}
        <div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Supplier Certifications</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={certData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                label={renderCustomizedLabel}
                isAnimationActive={true}
                animationDuration={900}
                paddingAngle={2}
              >
                {certData.map((entry, idx) => (
                  <Cell key={`cell-cert-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Buyer-Supplier Mapping Sankey */}
      <div className="mt-16">
        <BuyerSupplierSankey suppliers={suppliers} buyers={buyers} />
      </div>
    </div>
  );
}; 