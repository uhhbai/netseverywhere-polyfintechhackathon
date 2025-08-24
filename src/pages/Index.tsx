import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Gift, TrendingUp, Star, Zap, Target } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Seed realistic demo data for the current user (runs once)
  const seedFakeData = async () => {
    try {
      // 1) Ensure profile exists and has balance
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          user_id: user?.id,
          display_name: user?.email || 'User',
          balance: 850.75,
          total_spent: 2500.0,
          streak_count: 12
        });
      } else if ((existingProfile.balance ?? 0) < 1) {
        await supabase
          .from('profiles')
          .update({ balance: 850.75, total_spent: 2500.0, streak_count: 12 })
          .eq('user_id', user?.id);
      }

      // 2) Seed transactions if too few
      const { count: txnCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (!txnCount || txnCount < 6) {
        const merchants = ['Starbucks', "McDonald's", 'NTUC FairPrice', 'Din Tai Fung', 'Grab Transport', 'Uniqlo'];
        const amounts = [8.5, 12.9, 45.3, 68.4, 15.6, 89.9];
        const descriptions = ['Coffee and pastry', 'Lunch meal', 'Grocery shopping', 'Dinner with friends', 'Ride to office', 'New shirt'];
        const now = Date.now();
        const demo = merchants.map((m, i) => ({
          user_id: user?.id,
          merchant_name: m,
          amount: amounts[i],
          transaction_type: 'payment',
          description: descriptions[i],
          created_at: new Date(now - (i + 2) * 60 * 60 * 1000).toISOString()
        }));
        await supabase.from('transactions').insert(demo);
      }
    } catch (e) {
      console.error('Seeding error:', e);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      seedFakeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      </MobileFrame>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MobileFrame>
      <Header title="NETS for All" />
      
      {/* NETS Everywhere Branding */}
      <div className="bg-gradient-primary p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">NETS Everywhere</h2>
          <p className="text-sm opacity-90">Your digital wallet for everything</p>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceCard />

      {/* Feature Cards */}
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="col-span-2 bg-gradient-to-r from-primary/10 to-accent/10 card-hover cursor-pointer"
            onClick={() => navigate('/grouppay')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">NETS GroupPay</h3>
                  <p className="text-sm text-muted-foreground">Split bills effortlessly with friends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-accent/10 to-secondary/10 card-hover cursor-pointer"
            onClick={() => navigate('/streak')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Payment Streak</h3>
                  <p className="text-xs text-muted-foreground">Track progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-primary/10 to-accent/10 card-hover cursor-pointer"
            onClick={() => navigate('/scanning')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">QR Scanner</h3>
                  <p className="text-xs text-muted-foreground">Instant pay</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Index;