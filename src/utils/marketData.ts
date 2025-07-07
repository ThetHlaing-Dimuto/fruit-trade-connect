// USDA Market News API endpoint for fruit/veg prices (example: apples)
// Docs: https://search.ams.usda.gov/farmersmarkets/v1/data.svc/markets
// We'll use a mock endpoint for demo if real data is not available

// For demo, fallback mock data
const mockPrices: Record<string, { date: string, price: number }[]> = {
  apple: [
    { date: '2024-06-01', price: 1.20 },
    { date: '2024-06-08', price: 1.25 },
    { date: '2024-06-15', price: 1.22 },
    { date: '2024-06-22', price: 1.30 },
    { date: '2024-06-29', price: 1.28 },
  ],
  mango: [
    { date: '2024-06-01', price: 2.10 },
    { date: '2024-06-08', price: 2.15 },
    { date: '2024-06-15', price: 2.12 },
    { date: '2024-06-22', price: 2.18 },
    { date: '2024-06-29', price: 2.20 },
  ],
  durian: [
    { date: '2024-06-01', price: 5.00 },
    { date: '2024-06-08', price: 5.10 },
    { date: '2024-06-15', price: 5.05 },
    { date: '2024-06-22', price: 5.20 },
    { date: '2024-06-29', price: 5.15 },
  ],
};

// Add cache for price predictions
const pricePredictionCache: Record<string, {
  data: {
    current: number;
    predicted: number;
    history: { date: string; price: number }[];
    forecast: { month: string; price: number }[];
  };
  timestamp: number;
}> = {};
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function getRecentFruitPrices(fruit: string): Promise<{date: string, price: number}[]> {
  const key = fruit.toLowerCase();
  if (mockPrices[key]) {
    return mockPrices[key];
  }
  return mockPrices['apple'];
}

// Simple moving average prediction
function movingAverage(prices: number[]): number {
  if (prices.length === 0) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

// Simple linear regression prediction (predict next value)
function linearRegressionPredict(prices: number[]): number {
  const n = prices.length;
  if (n === 0) return 0;
  const x = prices.map((_, i) => i + 1);
  const y = prices;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return slope * (n + 1) + intercept;
}

function getNextMonths(startDate: string, count: number): string[] {
  const months: string[] = [];
  const date = new Date(startDate);
  for (let i = 1; i <= count; i++) {
    const next = new Date(date.getFullYear(), date.getMonth() + i, 1);
    months.push(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

// Main function: get current price, predicted price, history, and 6-month forecast
export async function getPricePrediction(
  fruit: string
): Promise<{
  current: number;
  predicted: number;
  history: { date: string; price: number }[];
  forecast: { month: string; price: number }[];
}> {
  const cacheKey = `${fruit.toLowerCase()}`;
  const now = Date.now();
  const cached = pricePredictionCache[cacheKey];
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }
  const history = await getRecentFruitPrices(fruit);
  const prices = history.map((h) => h.price);
  const current = prices[prices.length - 1] ?? 0;
  // Use both moving average and linear regression, then average them for demo
  const ma = movingAverage(prices);
  const lr = linearRegressionPredict(prices);
  const predicted = (ma + lr) / 2;

  // 6-month forecast using linear regression extrapolation
  const n = prices.length;
  const x = prices.map((_, i) => i + 1);
  const y = prices;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const lastDate = history[history.length - 1]?.date || '2024-06-29';
  const forecastMonths = getNextMonths(lastDate, 6);
  const forecast = forecastMonths.map((month, i) => ({
    month,
    price: slope * (n + i + 1) + intercept,
  }));

  const result = { current, predicted, history, forecast };
  pricePredictionCache[cacheKey] = { data: result, timestamp: now };
  return result;
}

export async function getLLMPriceExplanation({
  fruit,
  history,
  predicted
}: {
  fruit: string;
  history: {date: string, price: number}[];
  predicted: number;
}): Promise<string> {
  // Compose a prompt for the LLM
  const prompt = `
Given the following recent price data for ${fruit} (per kg):
${history.map(h => `${h.date}: $${h.price.toFixed(2)} per kg`).join('\n')}
The predicted price for next week is $${predicted.toFixed(2)} per kg.
Explain the main factors that could affect this price, and provide a confidence score (0-100) for this prediction. Respond in 2-3 sentences.
`;
  try {
    const response = await fetch(`${apiBaseUrl}/api/vertexChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });
    const data = await response.json();
    return data.content;
  } catch {
    return 'No explanation available.';
  }
}

export async function getComplianceCheck({
  name,
  country,
  fruitsOffered,
  certifications
}: {
  name: string;
  country: string;
  fruitsOffered: string[];
  certifications: string[];
}): Promise<string> {
  const prompt = `
You are a global food trade compliance expert. Given the following supplier profile:
- Name: ${name}
- Country: ${country}
- Fruits: ${fruitsOffered.join(', ')}
- Certifications: ${certifications.join(', ') || 'None'}

Please check and summarize:
1. If this supplier is compliant with major requirements for exporting to the EU and US markets for these fruits.
2. If any important certifications are missing for these markets.
3. Any general best-practices or compliance recommendations for international trade.

Assume all prices and quantities are per kg.
Respond in 3-5 sentences, clearly mentioning EU, US, and general best practices.
`;
  try {
    const response = await fetch(`${apiBaseUrl}/api/vertexChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });
    const data = await response.json();
    return data.content;
  } catch {
    return 'Compliance check not available.';
  }
}

export async function fetchGivvableCertifications({ name }: { name: string }): Promise<{ categories: string[]; credentialCount: number; raw?: unknown }> {
  // Call backend proxy endpoint
  const url = `${apiBaseUrl}/api/givvableCerts`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Givvable API error');
    }
    const data = await response.json();
    const company = data.companies?.[0];
    return {
      categories: company?.credentialCategories || [],
      credentialCount: company?.credentialCount || 0,
      raw: company
    };
  } catch {
    return { categories: [], credentialCount: 0 };
  }
} 