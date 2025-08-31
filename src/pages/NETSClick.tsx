import { useState, useEffect } from 'react';
import { Zap, Wifi, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ContactlessTransaction {
  id: string;
  merchant_name: string;
  amount: number;
  created_at: string;
  terminal_id: string;
}

const NETSClick = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNFCEnabled, setIsNFCEnabled] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<ContactlessTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentTransactions();
      checkNFCSupport();
    }
  }, [user]);

  const fetchRecentTransactions = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('transaction_type', 'contactless')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactions) {
        const contactlessTransactions = transactions.map(t => ({
          id: t.id,
          merchant_name: t.merchant_name,
          amount: Number(t.amount),
          created_at: t.created_at,
          terminal_id: `T${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
        }));
        setRecentTransactions(contactlessTransactions);
      }
    } catch (error) {
      console.error('Error fetching contactless transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNFCSupport = () => {
    // Simulate NFC check (in reality, this would check device capabilities)
    setIsNFCEnabled(true);
  };

  const enablePaymentMode = () => {
    if (!isNFCEnabled) {
      toast({
        title: "NFC Not Available",
        description: "Your device doesn't support NFC or it's disabled.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentReady(true);
    toast({
      title: "Payment Ready! 📱",
      description: "Hold your phone near the payment terminal to pay.",
    });

    // Auto-disable after 30 seconds for demo
    setTimeout(() => {
      setIsPaymentReady(false);
    }, 30000);
  };

  const simulatePayment = () => {
    const merchants = [
      'McDonald\'s Terminal #1',
      'Starbucks POS #3',
      'FairPrice Self-Checkout',
      'KFC Counter #2',
      'Subway Terminal #1'
    ];
    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const randomAmount = (Math.random() * 30 + 5).toFixed(2);

    // Create simulated transaction
    supabase
      .from('transactions')
      .insert({
        user_id: user?.id,
        merchant_name: randomMerchant,
        amount: Number(randomAmount),
        transaction_type: 'contactless',
        status: 'completed'
      })
      .then(() => {
        toast({
          title: "Payment Successful! ✅",
          description: `Paid $${randomAmount} at ${randomMerchant}`,
        });
        setIsPaymentReady(false);
        fetchRecentTransactions();
      });
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
          <div className="text-muted-foreground">Loading NETS Click...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="NETS Contactless" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Payment Interface */}
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
              isPaymentReady 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' 
                : 'bg-gradient-primary'
            }`}>
              {isPaymentReady ? (
                <Wifi size={64} className="text-white animate-bounce" />
              ) : (
                <Zap size={64} className="text-white" />
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">
                {isPaymentReady ? 'Ready to Pay' : 'NETS Contactless'}
              </h2>
              <p className="text-muted-foreground">
                {isPaymentReady 
                  ? 'Hold your phone near the payment terminal'
                  : 'Contactless payments with your phone'
                }
              </p>
            </div>

            {isPaymentReady ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-success">
                  <Wifi size={20} />
                  <span className="font-medium">Payment mode active</span>
                </div>
                <Button 
                  onClick={simulatePayment}
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-white"
                >
                  Simulate Payment
                </Button>
              </div>
            ) : (
              <Button 
                onClick={enablePaymentMode}
                className="w-full h-14 text-lg bg-gradient-primary"
                disabled={!isNFCEnabled}
              >
                <Zap className="mr-3" size={24} />
                Enable Payment Mode
              </Button>
            )}
          </div>
        </Card>

        {/* NFC Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className={isNFCEnabled ? 'text-success' : 'text-muted-foreground'} size={20} />
              <span className="font-medium">NFC Status</span>
            </div>
            <Badge className={isNFCEnabled ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}>
              {isNFCEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="text-primary" size={16} />
              </div>
              <div>
                <p className="font-medium">Secure Payments</p>
                <p className="text-sm text-muted-foreground">Bank-level security with tokenization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <Clock className="text-secondary" size={16} />
              </div>
              <div>
                <p className="font-medium">Instant Transactions</p>
                <p className="text-sm text-muted-foreground">Payment completes in under 2 seconds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <CreditCard className="text-accent" size={16} />
              </div>
              <div>
                <p className="font-medium">Works Everywhere</p>
                <p className="text-sm text-muted-foreground">Accepted at all NETS terminals</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Contactless Payments */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Recent Contactless Payments</h3>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Zap className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.merchant_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.terminal_id} • {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-success" />
                      <span className="text-xs text-success">Contactless</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No contactless payments yet</p>
              <p className="text-sm text-muted-foreground">Try your first tap-to-pay transaction!</p>
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <h4 className="font-semibold mb-3 text-indigo-800">⚡ NETS Contactless Tips</h4>
          <ul className="space-y-2 text-sm text-indigo-700">
            <li>• Hold your phone within 4cm of the payment terminal</li>
            <li>• No need to open the app - payments work from lock screen</li>
            <li>• Look for the contactless payment symbol on terminals</li>
            <li>• Transactions under $100 don't require PIN</li>
            <li>• Works with most modern Android and iPhone devices</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default NETSClick;