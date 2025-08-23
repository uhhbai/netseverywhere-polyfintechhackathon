import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Gift, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CashbackTransaction {
  id: string;
  merchant_name: string;
  amount: number;
  cashback_amount: number;
  created_at: string;
  status: string;
}

const Cashback = () => {
  const { user } = useAuth();
  const [totalCashback, setTotalCashback] = useState(0);
  const [pendingCashback, setPendingCashback] = useState(0);
  const [transactions, setTransactions] = useState<CashbackTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCashbackData();
    }
  }, [user]);

  const fetchCashbackData = async () => {
    try {
      // Fetch transactions with cashback
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionData) {
        // Simulate cashback calculation (2% for most merchants, 5% for dining)
        const cashbackTransactions = transactionData.map(transaction => {
          const isDining = ['Restaurant', 'Cafe', 'Food Court'].some(type => 
            transaction.merchant_name.toLowerCase().includes(type.toLowerCase())
          );
          const cashbackRate = isDining ? 0.05 : 0.02;
          const cashbackAmount = Number(transaction.amount) * cashbackRate;
          
          return {
            ...transaction,
            cashback_amount: cashbackAmount,
          };
        });

        setTransactions(cashbackTransactions);

        // Calculate total and pending cashback
        const total = cashbackTransactions.reduce((sum, t) => sum + t.cashback_amount, 0);
        const pending = cashbackTransactions
          .filter(t => t.status === 'completed')
          .slice(0, 5)
          .reduce((sum, t) => sum + t.cashback_amount, 0);

        setTotalCashback(total);
        setPendingCashback(pending);
      }
    } catch (error) {
      console.error('Error fetching cashback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading cashback...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Cashback Rewards" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Cashback Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} />
              <span className="text-sm text-blue-100">Total Earned</span>
            </div>
            <div className="text-2xl font-bold">${totalCashback.toFixed(2)}</div>
          </Card>
          
          <Card className="p-4 bg-gradient-secondary text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} />
              <span className="text-sm text-red-100">Pending</span>
            </div>
            <div className="text-2xl font-bold">${pendingCashback.toFixed(2)}</div>
          </Card>
        </div>

        {/* Cashback Rates */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Cashback Rates</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                  🍽️
                </div>
                <div>
                  <p className="font-medium">Dining & Food</p>
                  <p className="text-sm text-muted-foreground">Restaurants, cafes, food courts</p>
                </div>
              </div>
              <Badge className="bg-gradient-secondary text-white">5%</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  🛍️
                </div>
                <div>
                  <p className="font-medium">Shopping & Retail</p>
                  <p className="text-sm text-muted-foreground">All other merchants</p>
                </div>
              </div>
              <Badge className="bg-gradient-primary text-white">2%</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <p className="font-medium">Streak Bonus</p>
                  <p className="text-sm text-muted-foreground">Extra cashback for active users</p>
                </div>
              </div>
              <Badge className="bg-gradient-gold text-white">+1%</Badge>
            </div>
          </div>
        </Card>

        {/* Recent Cashback */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Recent Cashback</h3>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 8).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{transaction.merchant_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(transaction.amount).toFixed(2)} • {formatDate(transaction.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">+${transaction.cashback_amount.toFixed(2)}</p>
                  <Badge 
                    variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {transaction.status === 'completed' ? 'Earned' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cashback Tips */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <h4 className="font-semibold mb-3 text-green-800">💰 Maximize Your Cashback</h4>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Dine out with friends using NETS for 5% cashback</li>
            <li>• Maintain your payment streak for bonus cashback</li>
            <li>• Use GroupPay to split bills and earn on the full amount</li>
            <li>• Check exclusive merchant promotions for extra rewards</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Cashback;