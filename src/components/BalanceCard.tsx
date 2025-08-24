import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, QrCode, CreditCard, Receipt, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return (
    <div className="mx-6 mt-6">
      {/* Main Balance Card */}
      <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/80 text-sm font-medium">Account Balance</div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {showBalance ? <Eye size={18} className="text-white" /> : <EyeOff size={18} className="text-white" />}
            </button>
          </div>
          
          <div className="text-3xl font-bold mb-6">
            {showBalance ? `SGD ${balance.toFixed(2)}` : '••••••'}
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="bg-secondary rounded-2xl p-4 -mt-6 relative z-10 mx-4">
        <div className="grid grid-cols-4 gap-4 text-white text-center">
          <button 
            className="flex flex-col items-center gap-2"
            onClick={() => navigate('/scanning')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/>
                <rect x="7" y="7" width="3" height="3" fill="white"/>
                <rect x="14" y="7" width="3" height="3" fill="white"/>
                <rect x="7" y="14" width="3" height="3" fill="white"/>
                <rect x="14" y="14" width="3" height="3" fill="white"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2"
            onClick={() => navigate('/myqr')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium">My QR</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2"
            onClick={() => navigate('/receipts')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Receipt size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium">Receipts</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2"
            onClick={() => navigate('/profile')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium">My Cards</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;