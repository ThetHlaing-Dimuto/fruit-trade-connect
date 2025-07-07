import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, Supplier, Buyer } from '../types';
import { processMessage } from '../utils/messageProcessor';

interface ChatbotProps {
  messages: ChatMessage[];
  onAddMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  onAddBuyer: (buyer: Omit<Buyer, 'id'>) => Buyer;
  onViewSupplier: (id: string) => void;
  onViewBuyer: (id: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  messages,
  onAddMessage,
  onAddSupplier,
  onAddBuyer,
  onViewSupplier,
  onViewBuyer,
  isTyping,
  setIsTyping
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    onAddMessage({
      type: 'user',
      content: userMessage
    });

    // Show typing indicator
    setIsTyping(true);

    // Process message after a delay to simulate AI thinking
    setTimeout(async () => {
      const response = await processMessage(userMessage);
      setIsTyping(false);

      // Add bot response
      onAddMessage({
        type: 'bot',
        content: response.content,
        action: response.action,
        data: response.data
      });

      // Execute action if present
      if (response.action === 'add_supplier' && response.data) {
        const newSupplier = onAddSupplier(response.data);
        setTimeout(() => onViewSupplier(newSupplier.id), 1000);
      } else if (response.action === 'add_buyer' && response.data) {
        const newBuyer = onAddBuyer(response.data);
        setTimeout(() => onViewBuyer(newBuyer.id), 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-80 flex flex-col">
      <div
        className="chat-messages flex-1 overflow-y-auto p-2 space-y-2"
        style={{ maxHeight: '260px', minHeight: '120px' }}
      >
        {/* Intro message with examples */}
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 p-2 rounded-lg mr-2">
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">
                  Hello! I'm your fruit trade assistant. You can ask me to add suppliers or buyers to our platform using natural language<br />
                  <span className="block mt-2 text-gray-600">
                    <strong>Example:</strong> Add supplier FreshMart SG from Singapore that have mango and pineapple<br />
                    <strong>Example:</strong> Add buyer named Great Giant Pineapple from Indonesia that's going to import banana.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white ml-2'
                  : 'bg-gray-100 text-gray-800 mr-2'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'bot' && (
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-2 rounded-lg mr-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};