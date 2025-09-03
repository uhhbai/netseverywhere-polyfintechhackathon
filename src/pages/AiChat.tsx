import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your NETS AI assistant. I can help you with questions about the app, NETS services, payments, and more. What would you like to know?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getDemoResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // App-related questions
    if (message.includes('receipt') || message.includes('split') || message.includes('bill')) {
      return "You can easily split bills using our Receipt Sharing feature! Just scan your receipt, invite friends, and they can select their items. The app automatically calculates GST and service charges proportionally.";
    }
    
    if (message.includes('cashback') || message.includes('rewards')) {
      return "NETS offers amazing cashback rewards! You earn points on every transaction which can be redeemed for vouchers, discounts, or transferred to your bank account. Check the Cashback section to see your current earnings.";
    }
    
    if (message.includes('payment') || message.includes('pay')) {
      return "NETS supports various payment methods including QR codes, contactless payments, and online transactions. You can pay at over 120,000 merchants across Singapore!";
    }
    
    if (message.includes('security') || message.includes('safe')) {
      return "NETS uses bank-grade security with multi-factor authentication, encryption, and real-time fraud monitoring. All transactions are protected and monitored 24/7.";
    }
    
    // NETS general questions
    if (message.includes('nets') || message.includes('what is')) {
      return "NETS is Singapore's leading payment network, enabling secure digital payments since 1985. We connect consumers, merchants, and financial institutions across Singapore with innovative payment solutions.";
    }
    
    if (message.includes('merchant') || message.includes('business')) {
      return "NETS supports over 120,000 merchants in Singapore, from hawker stalls to major retailers. Businesses can accept payments via QR codes, POS terminals, and online payment gateways.";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! You can ask me about:\n• App features and navigation\n• NETS payment services\n• Cashback and rewards\n• Bill splitting and receipts\n• Security and safety\n• Merchant information\n\nWhat specific topic interests you?";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! NETS is constantly innovating to provide better payment experiences for Singaporeans.",
      "Thanks for asking! NETS processes millions of transactions daily, making digital payments seamless and secure.",
      "Great question! Our app is designed to make your payment experience as smooth as possible. Is there a specific feature you'd like to know more about?",
      "I'm here to help with any NETS-related questions. Whether it's about payments, rewards, or app features, feel free to ask!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getDemoResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <MobileFrame>
      <Header title="NETS AI Assistant" />
      
      <div className="flex flex-col h-full pb-24">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-primary-foreground" />
                </div>
              )}
              
              <Card className={`max-w-[80%] p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-2 opacity-70 ${
                  message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <User size={16} className="text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot size={16} className="text-primary-foreground" />
              </div>
              <Card className="bg-muted p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t bg-background p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about NETS..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </MobileFrame>
  );
};

export default AiChat;