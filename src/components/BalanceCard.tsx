import { Eye, EyeOff, QrCode, CreditCard, Receipt, Wallet } from 'lucide-react';
import { useState } from 'react';

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="mx-6 mt-4">
      {/* Main Balance Card */}
      <div className="bg-gradient-primary rounded-3xl p-6 text-white relative overflow-hidden shine-effect">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/80 text-sm font-medium">Account Balance</div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          
          <div className="text-3xl font-bold mb-4">
            {showBalance ? 'SGD 253.42' : 'SGD •••••'}
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="bg-secondary rounded-2xl p-4 -mt-6 relative z-10 mx-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <QrCode size={20} />
            <span className="text-sm font-medium">Scan</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={20} />
            <span className="text-sm font-medium">My QR</span>
          </div>
          <div className="flex items-center gap-2">
            <Receipt size={20} />
            <span className="text-sm font-medium">Receipts</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet size={20} />
            <span className="text-sm font-medium">My Cards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;