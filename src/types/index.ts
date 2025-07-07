export interface Supplier {
  id: string;
  name: string;
  location: string;
  country: string;
  fruitsOffered: string[];
  certifications: string[];
  contactEmail: string;
  contactPhone: string;
  description: string;
  priceRange: Record<string, { min: number; max: number; currency: string; unit: string }>;
  reliability: number; // 0-100
  established: number;
}

export interface Buyer {
  id: string;
  name: string;
  location: string;
  country: string;
  fruitsInterested: string[];
  contactEmail: string;
  contactPhone: string;
  description: string;
  budgetRange: Record<string, { min: number; max: number; currency: string; unit: string }>;
  volume: 'Small' | 'Medium' | 'Large';
  established: number;
  certifications?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  action?: 'add_supplier' | 'add_buyer' | 'view_supplier' | 'view_buyer';
  data?: any;
}

export interface PricePrediction {
  fruit: string;
  region: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  factors: string[];
  currency: string;
}

export interface ComplianceInfo {
  certification: string;
  status: 'Valid' | 'Expired' | 'Pending';
  expiryDate: string;
  issuer: string;
}