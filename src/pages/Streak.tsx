import { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';

const Streak = () => {
  const { user } = useAuth();
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [monthlyTransactions, setMonthlyTransactions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      // Fetch user profile for streak count
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setStreakCount(profile.streak_count || 0);
      }

      // Count this month's transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());

      setMonthlyTransactions(transactions?.length || 0);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </MobileFrame>
    );
  }

  const currentWeekProgress = Math.min(monthlyTransactions, weeklyGoal);
  const progressPercentage = (currentWeekProgress / weeklyGoal) * 100;

  return (
    <MobileFrame>
      <Header title="Streak & Goals" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Streak Counter */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Flame size={48} className="text-yellow-300 animate-glow" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{streakCount} Days</h2>
            <p className="text-blue-100">Payment Streak</p>
            <p className="text-sm text-blue-200 mt-2">
              Keep using NETS to maintain your streak!
            </p>
          </div>
        </Card>

        {/* Weekly Goal */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Weekly Goal</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{currentWeekProgress}/{weeklyGoal} payments</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {currentWeekProgress >= weeklyGoal && (
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <Trophy className="text-success mx-auto mb-2" size={24} />
                <p className="text-success font-medium">Weekly goal achieved! 🎉</p>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">This Month</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{monthlyTransactions}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">{streakCount}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </Card>

        {/* Streak Tips */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
          <h4 className="font-semibold mb-3 text-orange-800">💡 Streak Tips</h4>
          <ul className="space-y-2 text-sm text-orange-700">
            <li>• Make at least one NETS payment daily</li>
            <li>• Use GroupPay to split bills with friends</li>
            <li>• Check out exclusive promos for bonus streaks</li>
            <li>• Complete weekly challenges for streak multipliers</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Streak;