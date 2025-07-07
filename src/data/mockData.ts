import { Supplier, Buyer } from '../types';

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'PT Nusantara Segar Abadi',
    location: 'Indonesia',
    country: 'Indonesia',
    fruitsOffered: ['banana'],
    certifications: ['GLOBALG.A.P', 'Organic', 'Fair Trade'],
    contactEmail: 'info@nusantarasegarabadi.com',
    contactPhone: '+62-21-0000-0001',
    description: 'Leading Indonesian banana supplier',
    priceRange: {
      banana: { min: 1.2, max: 2.0, currency: 'USD', unit: 'kg' }
    },
    reliability: 90,
    established: 2010
  },
  {
    id: '2',
    name: 'Colombian Fruits and Minerals',
    location: 'Colombia',
    country: 'Colombia',
    fruitsOffered: ['limes','apple'],
    certifications: ['GLOBALG.A.P', 'BRC', 'Rainforest Alliance'],
    contactEmail: 'info@colombianfruits.com',
    contactPhone: '+57-1-0000-0002',
    description: 'Colombian exporter of fresh limes',
    priceRange: {
      limes: { min: 0.8, max: 1.5, currency: 'USD', unit: 'kg' }
    },
    reliability: 88,
    established: 2012
  },
  {
    id: '3',
    name: 'Vitassous',
    location: 'Colombia',
    country: 'Colombia',
    fruitsOffered: ['raspberry'],
    certifications: ['GLOBALG.A.P', 'Organic', 'IFS'],
    contactEmail: 'info@vitassous.com',
    contactPhone: '+57-1-0000-0003',
    description: 'Colombian raspberry supplier',
    priceRange: {
      raspberry: { min: 2.5, max: 4.0, currency: 'USD', unit: 'kg' }
    },
    reliability: 85,
    established: 2015
  },
  {
    id: '4',
    name: 'Truong Ton',
    location: 'Vietnam',
    country: 'Vietnam',
    fruitsOffered: ['banana'],
    certifications: ['GLOBALG.A.P', 'HACCP'],
    contactEmail: 'info@truongton.vn',
    contactPhone: '+84-28-0000-0004',
    description: 'Vietnamese banana exporter',
    priceRange: {
      banana: { min: 1.1, max: 1.9, currency: 'USD', unit: 'kg' }
    },
    reliability: 87,
    established: 2011
  }
];

export const mockBuyers: Buyer[] = [
  {
    id: '1',
    name: 'PT Sewu Segar Nusantara',
    location: 'Indonesia',
    country: 'Indonesia',
    fruitsInterested: ['banana','mango'],
    certifications: ['GLOBALG.A.P', 'Fair Trade'],
    contactEmail: 'buyer@sewusegar.com',
    contactPhone: '+62-21-1000-0001',
    description: 'Indonesian buyer of bananas',
    budgetRange: {
      banana: { min: 1.3, max: 2.2, currency: 'USD', unit: 'kg' }
    },
    volume: 'Large',
    established: 2008
  },
  {
    id: '2',
    name: 'Hacienda Sotomayor SL',
    location: 'Spain',
    country: 'Spain',
    fruitsInterested: ['limes'],
    certifications: ['Organic', 'BRC'],
    contactEmail: 'buyer@haciendasotomayor.es',
    contactPhone: '+34-91-000-0002',
    description: 'Spanish buyer of limes',
    budgetRange: {
      limes: { min: 1.0, max: 1.8, currency: 'EUR', unit: 'kg' }
    },
    volume: 'Medium',
    established: 2010
  },
  {
    id: '3',
    name: 'BAN CHOON MARKETING PTE LTD',
    location: 'Singapore',
    country: 'Singapore',
    fruitsInterested: ['raspberry'],
    certifications: ['IFS', 'GLOBALG.A.P'],
    contactEmail: 'buyer@banchoon.com.sg',
    contactPhone: '+65-6000-0003',
    description: 'Singaporean buyer of raspberries and blueberries',
    budgetRange: {
      raspberry: { min: 2.8, max: 4.5, currency: 'USD', unit: 'kg' },
      blueberry: { min: 3.0, max: 5.0, currency: 'USD', unit: 'kg' }
    },
    volume: 'Medium',
    established: 2005
  },
  {
    id: '4',
    name: 'Wismettac',
    location: 'Japan',
    country: 'Japan',
    fruitsInterested: ['banana'],
    certifications: ['GLOBALG.A.P', 'SQF'],
    contactEmail: 'buyer@wismettac.co.jp',
    contactPhone: '+81-3-0000-0004',
    description: 'Japanese buyer of bananas',
    budgetRange: {
      banana: { min: 1.4, max: 2.3, currency: 'USD', unit: 'kg' }
    },
    volume: 'Large',
    established: 1995
  }
];

export const availableFruits = [
  'mango', 'durian', 'rambutan', 'banana', 'pineapple', 'coconut',
  'dragon fruit', 'lychee', 'longan', 'papaya', 'jackfruit', 'mangosteen'
];

export const availableCountries = [
  'Thailand', 'Philippines', 'Vietnam', 'Singapore', 'Japan', 'Netherlands',
  'Malaysia', 'Indonesia', 'India', 'Australia', 'USA', 'Germany'
];

export const availableCertifications = [
  'GLOBALG.A.P', 'Organic', 'GMP', 'Rainforest Alliance', 'VietGAP',
  'HACCP', 'BRC', 'SQF', 'IFS', 'Fair Trade'
];