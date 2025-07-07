import React, { useState, useRef, useEffect } from 'react';
import { Citrus as Fruit, MessageSquare, TrendingUp, X, Users, BarChart2 } from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { Chatbot } from './components/Chatbot';
import { Directory } from './components/Directory';
import { SupplierDetail } from './components/SupplierDetail';
import { BuyerDetail } from './components/BuyerDetail';
import { BusinessIntelligenceChart } from './components/BusinessIntelligenceChart';

function App() {
  const {
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
  } = useAppState();

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId);

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', country: '', fruits: '' });
  const [buyerForm, setBuyerForm] = useState({ name: '', country: '', fruits: '' });

  // Tutorial modal state
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const tutorialSteps = [
    {
      icon: <Users className="w-8 h-8 text-green-600 mb-2" />,
      title: 'Directory',
      desc: 'Browse and manage all fruit suppliers and buyers. Add new entries, view details, and explore potential trading partners.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />,
      title: 'AI Trade Assistant',
      desc: 'Chat with our AI assistant for instant help, compliance checks, and smart suggestions to optimize your trading decisions.'
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-orange-600 mb-2" />,
      title: 'Business Intelligence Dashboard',
      desc: 'Visualize market trends, price predictions, and actionable insights to make data-driven business decisions.'
    }
  ];

  // Section refs for scrolling
  const directoryRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Scroll to section when tutorial step changes
  useEffect(() => {
    if (!showTutorial) return;
    const refs = [directoryRef, chatbotRef, dashboardRef];
    const ref = refs[tutorialStep];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tutorialStep, showTutorial]);

  const handleAddSupplier = () => {
    if (!supplierForm.name || !supplierForm.country || !supplierForm.fruits) return;
    addSupplier({
      name: supplierForm.name,
      country: supplierForm.country,
      location: supplierForm.country,
      fruitsOffered: supplierForm.fruits.split(',').map(f => f.trim()).filter(Boolean),
      certifications: [],
      contactEmail: '',
      contactPhone: '',
      description: '',
      priceRange: {},
      reliability: 80,
      established: new Date().getFullYear() - 1
    });
    setSupplierForm({ name: '', country: '', fruits: '' });
    setShowAddSupplier(false);
  };

  const handleAddBuyer = () => {
    if (!buyerForm.name || !buyerForm.country || !buyerForm.fruits) return;
    addBuyer({
      name: buyerForm.name,
      country: buyerForm.country,
      location: buyerForm.country,
      fruitsInterested: buyerForm.fruits.split(',').map(f => f.trim()).filter(Boolean),
      certifications: [],
      contactEmail: '',
      contactPhone: '',
      description: '',
      budgetRange: {},
      volume: 'Medium',
      established: new Date().getFullYear() - 1
    });
    setBuyerForm({ name: '', country: '', fruits: '' });
    setShowAddBuyer(false);
  };

  if (currentView === 'supplier' && selectedSupplier) {
    return (
      <SupplierDetail
        supplier={selectedSupplier}
        buyers={buyers}
        onBack={goBackToMain}
        onViewBuyer={viewBuyer}
      />
    );
  }

  if (currentView === 'buyer' && selectedBuyer) {
    return (
      <BuyerDetail
        buyer={selectedBuyer}
        suppliers={suppliers}
        onBack={goBackToMain}
        onViewSupplier={viewSupplier}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Step-by-step Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowTutorial(false)}
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              {tutorialSteps[tutorialStep].icon}
              <h2 className="text-2xl font-bold mb-2">{tutorialSteps[tutorialStep].title}</h2>
              <p className="text-gray-700 mb-6">{tutorialSteps[tutorialStep].desc}</p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium disabled:opacity-50"
                  onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
                  disabled={tutorialStep === 0}
                >Back</button>
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={() => setTutorialStep(s => s + 1)}
                  >Next</button>
                ) : (
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    onClick={() => setShowTutorial(false)}
                  >Finish</button>
                )}
              </div>
              <div className="flex gap-1 mt-6 justify-center">
                {tutorialSteps.map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2 h-2 rounded-full ${i === tutorialStep ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Fruit className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FruitTrade Connect</h1>
                <p className="text-sm text-gray-600">Global Fruit Trading Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Real-time Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Directory Section */}
        <div ref={directoryRef} />
        <Directory
          suppliers={suppliers}
          buyers={buyers}
          onViewSupplier={viewSupplier}
          onViewBuyer={viewBuyer}
          onAddSupplier={() => setShowAddSupplier(v => !v)}
          onAddBuyer={() => setShowAddBuyer(v => !v)}
          renderSupplierForm={showAddSupplier ? (
            <div className="bg-white border border-gray-200 rounded p-3 mb-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Name" value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} />
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Country" value={supplierForm.country} onChange={e => setSupplierForm(f => ({ ...f, country: e.target.value }))} />
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Fruits (comma separated)" value={supplierForm.fruits} onChange={e => setSupplierForm(f => ({ ...f, fruits: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200" onClick={() => setShowAddSupplier(false)}>Cancel</button>
                <button className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700" onClick={handleAddSupplier}>Add Supplier</button>
              </div>
            </div>
          ) : null}
          renderBuyerForm={showAddBuyer ? (
            <div className="bg-white border border-gray-200 rounded p-3 mb-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Name" value={buyerForm.name} onChange={e => setBuyerForm(f => ({ ...f, name: e.target.value }))} />
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Country" value={buyerForm.country} onChange={e => setBuyerForm(f => ({ ...f, country: e.target.value }))} />
                <input className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Fruits (comma separated)" value={buyerForm.fruits} onChange={e => setBuyerForm(f => ({ ...f, fruits: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200" onClick={() => setShowAddBuyer(false)}>Cancel</button>
                <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleAddBuyer}>Add Buyer</button>
              </div>
            </div>
          ) : null}
        />
        {/* Chatbot Section */}
        <div ref={chatbotRef} className="mb-8 mt-8">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Trade Assistant</h2>
          </div>
          <Chatbot
            messages={messages}
            onAddMessage={addMessage}
            onAddSupplier={addSupplier}
            onAddBuyer={addBuyer}
            onViewSupplier={viewSupplier}
            onViewBuyer={viewBuyer}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
          />
        </div>
        {/* Business Intelligence Dashboard */}
        <div ref={dashboardRef}>
          <BusinessIntelligenceChart suppliers={suppliers} buyers={buyers} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Fruit className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-gray-900">FruitTrade Connect</span>
              </div>
              <p className="text-sm text-gray-600">
                Connecting global fruit suppliers and buyers with AI-powered insights
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>AI Chat Assistant</li>
                <li>Price Predictions</li>
                <li>Trade Risk Analysis</li>
                <li>Compliance Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Markets</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Southeast Asia</li>
                <li>Europe</li>
                <li>North America</li>
                <li>Australia</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>API Access</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 FruitTrade Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;