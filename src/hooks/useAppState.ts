import { useState, useCallback } from 'react';
import { Supplier, Buyer, ChatMessage } from '../types';
import { mockSuppliers, mockBuyers } from '../data/mockData';

export type ViewType = 'main' | 'supplier' | 'buyer';

export const useAppState = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [buyers, setBuyers] = useState<Buyer[]>(mockBuyers);
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Removed old intro message. Start with an empty chat history.
  ]);
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      priceRange: Object.fromEntries(
        Object.entries(supplier.priceRange ?? {}).map(([fruit, range]) => [fruit, { ...range, unit: 'kg' }])
      )
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const addBuyer = useCallback((buyer: Omit<Buyer, 'id'>) => {
    const newBuyer: Buyer = {
      ...buyer,
      id: Date.now().toString(),
      budgetRange: Object.fromEntries(
        Object.entries(buyer.budgetRange ?? {}).map(([fruit, range]) => [fruit, { ...range, unit: 'kg' }])
      )
    };
    setBuyers(prev => [...prev, newBuyer]);
    return newBuyer;
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const viewSupplier = useCallback((id: string) => {
    setSelectedSupplierId(id);
    setCurrentView('supplier');
  }, []);

  const viewBuyer = useCallback((id: string) => {
    setSelectedBuyerId(id);
    setCurrentView('buyer');
  }, []);

  const goBackToMain = useCallback(() => {
    setCurrentView('main');
    setSelectedSupplierId('');
    setSelectedBuyerId('');
  }, []);

  return {
    suppliers,
    buyers,
    messages,
    currentView,
    selectedSupplierId,
    selectedBuyerId,
    isTyping,
    setIsTyping,
    addSupplier,
    addBuyer,
    addMessage,
    viewSupplier,
    viewBuyer,
    goBackToMain
  };
};