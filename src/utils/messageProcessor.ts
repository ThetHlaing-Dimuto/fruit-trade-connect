// (Removed unused imports)

interface ProcessedMessage {
  content: string;
  action?: 'add_supplier' | 'add_buyer' | 'view_supplier' | 'view_buyer';
  data?: any;
}

function extractSupplierInfoFromText(text: string) {
  // Remove markdown, bold, italics, and table pipes
  let clean = text.replace(/[*_`|]/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
  // Try to match name
  let nameMatch = clean.match(/(?:Supplier Name|name is|SupplierName)[:\s]*([A-Za-z0-9\s]+)/i);
  // Try to match country
  let countryMatch = clean.match(/Country[:\s]*([A-Za-z0-9\s]+)/i) || clean.match(/from\s+([A-Za-z0-9\s]+)/i);
  // Try to match fruits
  let fruitsMatch = clean.match(/Product(?:\(s\))?(?: Imported)?[:\s]*([A-Za-z0-9,\sand]+)/i) || clean.match(/fruits importing is[:\s]*([A-Za-z0-9,\sand]+)/i);

  const name = nameMatch ? nameMatch[1].trim() : null;
  const country = countryMatch ? countryMatch[1].trim() : null;
  const fruitsText = fruitsMatch ? fruitsMatch[1].trim() : '';
  const fruits = fruitsText
    .split(/,|\band\b|\s+/i)
    .map(fruit => fruit.trim().toLowerCase())
    .filter(fruit => fruit.length > 0 && fruit !== 'and');

  if (name && country && fruits.length > 0) {
    return { name, country, fruits };
  }
  return null;
}

function extractBuyerInfoFromText(text: string) {
  // Remove markdown, bold, italics, and table pipes
  const clean = text.replace(/[*_`|]/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
  // Try to match name
  const nameMatch = clean.match(/(?:Buyer Name|name is|BuyerName)[:\s]*([A-Za-z0-9\s]+)/i);
  // Try to match country
  const countryMatch = clean.match(/Country[:\s]*([A-Za-z0-9\s]+)/i) || clean.match(/from\s+([A-Za-z0-9\s]+)/i);
  // Try to match fruits
  const fruitsMatch = clean.match(/Product(?:\(s\))?(?: Interested)?[:\s]*([A-Za-z0-9,\sand]+)/i) || clean.match(/fruits interested in[:\s]*([A-Za-z0-9,\sand]+)/i) || clean.match(/interested in[:\s]*([A-Za-z0-9,\sand]+)/i);

  const name = nameMatch ? nameMatch[1].trim() : null;
  const country = countryMatch ? countryMatch[1].trim() : null;
  const fruitsText = fruitsMatch ? fruitsMatch[1].trim() : '';
  const fruits = fruitsText
    .split(/,|\band\b|\s+/i)
    .map(fruit => fruit.trim().toLowerCase())
    .filter(fruit => fruit.length > 0 && fruit !== 'and');

  if (name && fruits.length > 0) {
    return { name, country, fruits };
  }
  return null;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const processMessage = async (message: string): Promise<ProcessedMessage> => {
  // Intercept "add supplier" intent
  if (/add supplier|create supplier/i.test(message)) {
    // First attempt: strict prompt
    const extractionPrompt = `
Extract the supplier name, country, and fruits from the following message.
Respond ONLY with a valid JSON object with these keys: name, country, fruits (as an array).
Do not include any explanation or extra text.
If any field is missing, use null or an empty array.

Message: "${message}"
`;
    try {
      const response = await fetch(`${apiBaseUrl}/api/vertexChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: extractionPrompt }),
      });
      const data = await response.json();
      const jsonText = data.content.replace(/```json|```/g, '').trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) {
        const extracted = JSON.parse(match[0]);
        const name = extracted.name || null;
        const country = extracted.country || null;
        const fruits = Array.isArray(extracted.fruits) ? extracted.fruits : [];
        if (name && country && fruits.length > 0) {
          return {
            content: `Great! I've created a new supplier profile for ${name} from ${country}. They offer ${fruits.join(', ')}. I'll redirect you to their profile page to complete the details.`,
            action: 'add_supplier',
            data: {
              name,
              country,
              fruitsOffered: fruits,
            }
          };
        } else {
          return {
            content: `I found the following info: name: ${name}, country: ${country}, fruits: ${fruits.join(', ')}. Please provide any missing information.`
          };
        }
      } else {
        // Fallback: try a second, even stricter prompt
        const fallbackPrompt = `
Just respond with a JSON object with keys: name, country, fruits (as an array). No explanation, no markdown, no template, just JSON. Message: "${message}"
`;
        const fallbackResponse = await fetch(`${apiBaseUrl}/api/vertexChat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fallbackPrompt }),
        });
        const fallbackData = await fallbackResponse.json();
        const fallbackJson = fallbackData.content.replace(/```json|```/g, '').trim();
        const fallbackMatch = fallbackJson.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          const extracted = JSON.parse(fallbackMatch[0]);
          const name = extracted.name || null;
          const country = extracted.country || null;
          const fruits = Array.isArray(extracted.fruits) ? extracted.fruits : [];
          if (name && country && fruits.length > 0) {
            return {
              content: `Great! I've created a new supplier profile for ${name} from ${country}. They offer ${fruits.join(', ')}. I'll redirect you to their profile page to complete the details.`,
              action: 'add_supplier',
              data: {
                name,
                country,
                fruitsOffered: fruits,
              }
            };
          }
        }
        // Final fallback: robust regex extraction from LLM response and user message
        const sources = [fallbackData?.content, data?.content, message];
        for (const source of sources) {
          if (!source) continue;
          const extracted = extractSupplierInfoFromText(source);
          if (extracted) {
            return {
              content: `Great! I've created a new supplier profile for ${extracted.name} from ${extracted.country}. They offer ${extracted.fruits.join(', ')}. I'll redirect you to their profile page to complete the details.`,
              action: 'add_supplier',
              data: {
                name: extracted.name,
                country: extracted.country,
                fruitsOffered: extracted.fruits,
              }
            };
          }
        }
        return { content: "Sorry, I couldn't extract the supplier details. Please provide the name, country, and fruits." };
      }
    } catch (e) {
      return { content: "Sorry, there was an error extracting supplier details." };
    }
  }

  // Intercept "add buyer" intent
  if (/add buyer|create buyer/i.test(message)) {
    // First attempt: strict prompt
    const extractionPrompt = `
Extract the buyer name, country, and fruits interested from the following message.
Respond ONLY with a valid JSON object with these keys: name, country, fruits (as an array).
Do not include any explanation or extra text.
If any field is missing, use null or an empty array.

Message: "${message}"
`;
    try {
      const response = await fetch(`${apiBaseUrl}/api/vertexChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: extractionPrompt }),
      });
      const data = await response.json();
      const jsonText = data.content.replace(/```json|```/g, '').trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) {
        const extracted = JSON.parse(match[0]);
        const name = extracted.name || null;
        const country = extracted.country || null;
        const fruits = Array.isArray(extracted.fruits) ? extracted.fruits : [];
        if (name && fruits.length > 0) {
          return {
            content: `Excellent! I've created a new buyer profile for ${name}${country ? ' from ' + country : ''}. They're interested in ${fruits.join(', ')}. I'll redirect you to their profile page to add more details.`,
            action: 'add_buyer',
            data: {
              name,
              country: country ?? '',
              fruitsInterested: fruits,
              // Add any other fields your UI expects here
            }
          };
        } else {
          return {
            content: `I found the following info: name: ${name}, country: ${country}, fruits: ${fruits.join(', ')}. Please provide any missing information.`
          };
        }
      } else {
        // Fallback: try a second, even stricter prompt
        const fallbackPrompt = `
Just respond with a JSON object with keys: name, country, fruits (as an array). No explanation, no markdown, no template, just JSON. Message: "${message}"
`;
        const fallbackResponse = await fetch(`${apiBaseUrl}/api/vertexChat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fallbackPrompt }),
        });
        const fallbackData = await fallbackResponse.json();
        const fallbackJson = fallbackData.content.replace(/```json|```/g, '').trim();
        const fallbackMatch = fallbackJson.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          const extracted = JSON.parse(fallbackMatch[0]);
          const name = extracted.name || null;
          const country = extracted.country || null;
          const fruits = Array.isArray(extracted.fruits) ? extracted.fruits : [];
          if (name && fruits.length > 0) {
            return {
              content: `Excellent! I've created a new buyer profile for ${name}${country ? ' from ' + country : ''}. They're interested in ${fruits.join(', ')}. I'll redirect you to their profile page to add more details.`,
              action: 'add_buyer',
              data: {
                name,
                country: country ?? '',
                fruitsInterested: fruits,
              }
            };
          }
        }
        // Final fallback: robust regex extraction from LLM response and user message
        const sources = [fallbackData?.content, data?.content, message];
        for (const source of sources) {
          if (!source) continue;
          const extracted = extractBuyerInfoFromText(source);
          if (extracted) {
            return {
              content: `Excellent! I've created a new buyer profile for ${extracted.name}${extracted.country ? ' from ' + extracted.country : ''}. They're interested in ${extracted.fruits.join(', ')}. I'll redirect you to their profile page to add more details.`,
              action: 'add_buyer',
              data: {
                name: extracted.name,
                country: extracted.country ?? '',
                fruitsInterested: extracted.fruits,
              }
            };
          }
        }
        return { content: "Sorry, I couldn't extract the buyer details. Please provide the name and fruits they're interested in." };
      }
    } catch (e) {
      return { content: "Sorry, there was an error extracting buyer details." };
    }
  }

  // Otherwise, call the Express Vertex AI backend API
  try {
    const response = await fetch(`${apiBaseUrl}/api/vertexChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to get response from Vertex AI');
    }
    const data = await response.json();
    const jsonText = data.content.replace(/```json|```/g, '').trim();
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (match) {
      const extracted = JSON.parse(match[0]);
      const name = extracted.name || null;
      const fruits = Array.isArray(extracted.fruits) ? extracted.fruits : [];
      if (name && fruits.length > 0) {
        return {
          content: `Sorry, I couldn't extract all details, but I've created a new profile for ${name}. They're interested in ${fruits.join(', ')}.`,
          action: 'add_buyer',
          data: {
            name,
            country: '',
            fruitsInterested: fruits,
          }
        };
      }
    }
    return { content: 'Sorry, there was an error connecting to the AI service.' };
  } catch {
    return { content: 'Sorry, there was an error connecting to the AI service.' };
  }
};

const processSupplierAddition = (message: string): ProcessedMessage => {
  // Improved regex: more robust and flexible
  const nameMatch = message.match(/(?:add|create) supplier\s+(.+?)\s+from\s+/i);
  const countryMatch = message.match(/from\s+(.+?)\s+offering\s+/i);
  const fruitsMatch = message.match(/offering\s+(.+)/i);

  if (!nameMatch || !countryMatch || !fruitsMatch) {
    return {
      content: 'I need more information to add a supplier. Please provide the name, country, and fruits offered. For example: "Add supplier Golden Orchard from Thailand offering mango and durian"'
    };
  }

  const name = nameMatch[1].trim();
  const country = countryMatch[1].trim();
  const fruitsText = fruitsMatch[1].trim();
  // Parse fruits: split by 'and', ',' or just spaces
  const fruits = fruitsText
    .split(/,|\band\b|\s+/i)
    .map(fruit => fruit.trim().toLowerCase())
    .filter(fruit => fruit.length > 0 && fruit !== 'and');

  const supplierData = {
    name,
    location: `${country}`,
    country,
    fruitsOffered: fruits,
    certifications: ['GLOBALG.A.P'], // Default certification
    contactEmail: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: '+1-234-567-8900',
    description: `Premium fruit supplier from ${country}`,
    priceRange: fruits.reduce((acc, fruit) => {
      acc[fruit] = { min: 2.0, max: 5.0, currency: 'USD', unit: 'kg' };
      return acc;
    }, {} as Record<string, { min: number; max: number; currency: string; unit: string }>),
    reliability: 85,
    established: new Date().getFullYear() - 5
  };

  return {
    content: `Great! I've created a new supplier profile for ${name} from ${country}. They offer ${fruits.join(', ')}. I'll redirect you to their profile page to complete the details.`,
    action: 'add_supplier',
    data: supplierData
  };
};

const processBuyerAddition = (message: string): ProcessedMessage => {
  const patterns = {
    name: /(?:add buyer|create buyer)\s+([^from]+?)(?:\s+from|\s+interested)/i,
    country: /from\s+([^interested]+?)(?:\s+interested)/i,
    fruits: /interested in\s+(.+?)(?:\s+and\s+|$)/i
  };

  const nameMatch = message.match(patterns.name);
  const countryMatch = message.match(patterns.country);
  const fruitsMatch = message.match(patterns.fruits);

  if (!nameMatch || !fruitsMatch) {
    return {
      content: 'I need more information to add a buyer. Please provide the name and fruits they\'re interested in. For example: "Add buyer FreshMart SG interested in mango and pineapple"'
    };
  }

  const name = nameMatch[1].trim();
  const country = countryMatch ? countryMatch[1].trim() : 'Unknown';
  const fruitsText = fruitsMatch[1].trim();
  
  // Parse fruits
  const fruits = fruitsText
    .split(/\s+and\s+|,\s*/)
    .map(fruit => fruit.trim().toLowerCase())
    .filter(fruit => fruit.length > 0);

  const buyerData = {
    name,
    location: country !== 'Unknown' ? country : 'Location not specified',
    country,
    fruitsInterested: fruits,
    contactEmail: `procurement@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: '+1-234-567-8900',
    description: `Fruit buyer interested in ${fruits.join(', ')}`,
    budgetRange: fruits.reduce((acc, fruit) => {
      acc[fruit] = { min: 1.5, max: 4.0, currency: 'USD', unit: 'kg' };
      return acc;
    }, {} as Record<string, { min: number; max: number; currency: string; unit: string }>),
    volume: 'Medium' as const,
    established: new Date().getFullYear() - 3
  };

  return {
    content: `Excellent! I've created a new buyer profile for ${name}. They're interested in ${fruits.join(', ')}. I'll redirect you to their profile page to add more details.`,
    action: 'add_buyer',
    data: buyerData
  };
};