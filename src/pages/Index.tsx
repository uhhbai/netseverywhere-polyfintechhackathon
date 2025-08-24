import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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