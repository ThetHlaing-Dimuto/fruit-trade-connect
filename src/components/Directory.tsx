import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, Users, Package } from 'lucide-react';
import { Supplier, Buyer } from '../types';
import { availableFruits, availableCountries, availableCertifications } from '../data/mockData';

interface DirectoryProps {
  suppliers: Supplier[];
  buyers: Buyer[];
  onViewSupplier: (id: string) => void;
  onViewBuyer: (id: string) => void;
  onAddSupplier?: () => void;
  onAddBuyer?: () => void;
  renderSupplierForm?: React.ReactNode;
  renderBuyerForm?: React.ReactNode;
}

export const Directory: React.FC<DirectoryProps> = ({
  suppliers,
  buyers,
  onViewSupplier,
  onViewBuyer,
  onAddSupplier,
  onAddBuyer,
  renderSupplierForm,
  renderBuyerForm
}) => {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [supplierFilters, setSupplierFilters] = useState({
    country: '',
    fruit: '',
    certification: ''
  });
  const [buyerFilters, setBuyerFilters] = useState({
    country: '',
    fruit: '',
    volume: ''
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                           supplier.location.toLowerCase().includes(supplierSearch.toLowerCase());
      
      const matchesCountry = !supplierFilters.country || supplier.country === supplierFilters.country;
      const matchesFruit = !supplierFilters.fruit || supplier.fruitsOffered.includes(supplierFilters.fruit);
      const matchesCertification = !supplierFilters.certification || supplier.certifications.includes(supplierFilters.certification);
      
      return matchesSearch && matchesCountry && matchesFruit && matchesCertification;
    });
  }, [suppliers, supplierSearch, supplierFilters]);

  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      const matchesSearch = buyer.name.toLowerCase().includes(buyerSearch.toLowerCase()) ||
                           buyer.location.toLowerCase().includes(buyerSearch.toLowerCase());
      
      const matchesCountry = !buyerFilters.country || buyer.country === buyerFilters.country;
      const matchesFruit = !buyerFilters.fruit || buyer.fruitsInterested.includes(buyerFilters.fruit);
      const matchesVolume = !buyerFilters.volume || buyer.volume === buyerFilters.volume;
      
      return matchesSearch && matchesCountry && matchesFruit && matchesVolume;
    });
  }, [buyers, buyerSearch, buyerFilters]);

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewSupplier(supplier.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{supplier.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {supplier.location ?? supplier.country ?? 'N/A'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{supplier.reliability ?? 'N/A'}%</span>
        </div>
      </div>
      {/* Price Range Display */}
      {supplier.priceRange && Object.entries(supplier.priceRange).map(([fruit, range]) => (
        <div key={fruit} className="text-xs text-gray-500 mb-1">
          {fruit}: ${range.min}-{range.max} {range.currency} per {range.unit ?? 'kg'}
        </div>
      ))}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(supplier.fruitsOffered) ? supplier.fruitsOffered.map(fruit => (
            <span key={fruit} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {fruit}
            </span>
          )) : null}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {Array.isArray(supplier.certifications) ? supplier.certifications.map(cert => (
          <span key={cert} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {cert}
          </span>
        )) : null}
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2">{supplier.description ?? ''}</p>
    </div>
  );

  const BuyerCard = ({ buyer }: { buyer: Buyer }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewBuyer(buyer.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{buyer.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {buyer.location ?? buyer.country ?? 'N/A'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">{buyer.volume ?? 'N/A'}</span>
        </div>
      </div>
      {/* Budget Range Display */}
      {buyer.budgetRange && Object.entries(buyer.budgetRange).map(([fruit, range]) => (
        <div key={fruit} className="text-xs text-gray-500 mb-1">
          {fruit}: ${range.min}-{range.max} {range.currency} per {range.unit ?? 'kg'}
        </div>
      ))}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(buyer.fruitsInterested) ? buyer.fruitsInterested.map(fruit => (
            <span key={fruit} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {fruit}
            </span>
          )) : null}
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{buyer.description ?? ''}</p>
      <div className="text-xs text-gray-500 mt-2">
        Est. {buyer.established ?? 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Suppliers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{filteredSuppliers.length}</span>
          {onAddSupplier && (
            <button className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs ml-2" onClick={onAddSupplier}>
              <span className="text-base font-bold">+</span> New Supplier
            </button>
          )}
        </div>
        {renderSupplierForm}
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <select
              value={supplierFilters.country}
              onChange={(e) => setSupplierFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">All Countries</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select
              value={supplierFilters.fruit}
              onChange={(e) => setSupplierFilters(prev => ({ ...prev, fruit: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">All Fruits</option>
              {availableFruits.map(fruit => (
                <option key={fruit} value={fruit}>{fruit}</option>
              ))}
            </select>
            
            <select
              value={supplierFilters.certification}
              onChange={(e) => setSupplierFilters(prev => ({ ...prev, certification: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">All Certifications</option>
              {availableCertifications.map(cert => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Suppliers List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSuppliers.map(supplier => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No suppliers found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Buyers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Buyers</h2>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">{filteredBuyers.length}</span>
          {onAddBuyer && (
            <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs ml-2" onClick={onAddBuyer}>
              <span className="text-base font-bold">+</span> New Buyer
            </button>
          )}
        </div>
        {renderBuyerForm}
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search buyers..."
              value={buyerSearch}
              onChange={(e) => setBuyerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <select
              value={buyerFilters.country}
              onChange={(e) => setBuyerFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Countries</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select
              value={buyerFilters.fruit}
              onChange={(e) => setBuyerFilters(prev => ({ ...prev, fruit: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Fruits</option>
              {availableFruits.map(fruit => (
                <option key={fruit} value={fruit}>{fruit}</option>
              ))}
            </select>
            
            <select
              value={buyerFilters.volume}
              onChange={(e) => setBuyerFilters(prev => ({ ...prev, volume: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Volumes</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>
        
        {/* Buyers List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredBuyers.map(buyer => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
          {filteredBuyers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No buyers found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};