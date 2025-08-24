import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Gift, TrendingUp, Star, Zap, Target, Receipt } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Seed comprehensive demo data for the current user (runs once)
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
          display_name: user?.email?.split('@')[0] || 'User',
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

      if (!txnCount || txnCount < 8) {
        const merchants = ['Starbucks', "McDonald's", 'NTUC FairPrice', 'Din Tai Fung', 'Grab Transport', 'Uniqlo', 'Ya Kun Kaya Toast', 'Watsons'];
        const amounts = [8.50, 12.90, 45.30, 68.40, 15.60, 89.90, 7.20, 24.50];
        const descriptions = ['Coffee and pastry', 'Lunch meal', 'Grocery shopping', 'Dinner with friends', 'Ride to office', 'New shirt', 'Breakfast set', 'Personal care items'];
        const now = Date.now();
        const demo = merchants.map((m, i) => ({
          user_id: user?.id,
          merchant_name: m,
          amount: amounts[i],
          transaction_type: 'payment',
          description: descriptions[i],
          created_at: new Date(now - (i + 1) * 3 * 60 * 60 * 1000).toISOString() // Every 3 hours
        }));
        await supabase.from('transactions').insert(demo);
      }

      // 3) Seed sample notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (!notifCount || notifCount < 3) {
        const sampleNotifications = [
          {
            user_id: user?.id,
            title: 'Payment Successful',
            message: 'Payment to Din Tai Fung $68.40 completed successfully',
            notification_type: 'payment',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: user?.id,
            title: 'Referral Reward',
            message: 'You earned $10 from referring Sarah! 🎉',
            notification_type: 'reward',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: user?.id,
            title: 'Group Pay Request',
            message: 'Alex invited you to split the Din Tai Fung bill',
            notification_type: 'group_pay',
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        ];
        await supabase.from('notifications').insert(sampleNotifications);
      }

      // 4) Seed sample referrals
      const { count: refCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user?.id);

      if (!refCount || refCount < 2) {
        const sampleReferrals = [
          {
            referrer_id: user?.id,
            referral_code: `NETS${user?.id?.substring(0, 8).toUpperCase()}`,
            referee_email: 'sarah.chen@example.com',
            status: 'completed',
            reward_amount: 10.00,
            completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            referrer_id: user?.id,
            referral_code: `NETS${user?.id?.substring(0, 8).toUpperCase()}`,
            referee_email: 'alex.kumar@example.com',
            status: 'pending',
            reward_amount: 10.00
          }
        ];
        await supabase.from('referrals').insert(sampleReferrals);
      }

      // 5) Call function to seed demo users for leaderboard
      await supabase.rpc('seed_demo_users');

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
      <Header title="NETSEverywhere" />
      
      {/* NETS Everywhere Branding */}
      <div className="bg-gradient-primary p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">NETS Everywhere</h2>
          <p className="text-sm opacity-90">Your one stop for all things NETS</p>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceCard />

      {/* Feature Cards */}
      <div className="p-4 space-y-6 pb-28">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="bg-gradient-to-r from-primary/10 to-accent/10 card-hover cursor-pointer"
            onClick={() => navigate('/receipts')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">NETS GroupPay</h3>
                  <p className="text-sm text-muted-foreground">Create & split bills</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-secondary/10 to-primary/10 card-hover cursor-pointer"
            onClick={() => navigate('/shared-orders')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Shared Orders</h3>
                  <p className="text-sm text-muted-foreground">Pay your share</p>
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

          <Card 
            className="bg-gradient-to-br from-accent/10 to-secondary/10 card-hover cursor-pointer"
            onClick={() => navigate('/receipts')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">My Receipts</h3>
                  <p className="text-xs text-muted-foreground">Transaction history</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-secondary/10 to-primary/10 card-hover cursor-pointer"
            onClick={() => navigate('/referrals')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Referrals</h3>
                  <p className="text-xs text-muted-foreground">Earn rewards</p>
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