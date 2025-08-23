import { Eye, EyeOff, QrCode, CreditCard, Receipt, Wallet } from 'lucide-react';
import { useState } from 'react';

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(true);

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
              <Eye size={18} className="text-white" />
            </button>
          </div>
          
          <div className="text-3xl font-bold mb-6">
            SGD 253.42
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="bg-secondary rounded-2xl p-4 -mt-6 relative z-10 mx-4">
        <div className="grid grid-cols-4 gap-4 text-white text-center">
          <div className="flex flex-col items-center gap-2">
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
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xs font-medium">My QR</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" fill="none"/>
                <polyline points="14,2 14,8 20,8" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Receipts</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="2"/>
                <path d="M9 15h6" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xs font-medium">My Cards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;