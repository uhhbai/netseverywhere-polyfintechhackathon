import { useState, useEffect } from 'react';
import { Award, Star, Target, Users, Flame, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchBadgesData();
    }
  }, [user]);

  const fetchBadgesData = async () => {
    try {
      // Fetch user profile and transaction data
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count, total_spent')
        .eq('user_id', user?.id)
        .single();

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);

      // Generate badges based on user data
      const userStreakCount = profile?.streak_count || 0;
      const userTotalSpent = profile?.total_spent || 0;
      const transactionCount = transactions?.length || 0;

      const allBadges: UserBadge[] = [
        // Streak Badges
        {
          id: 'first-payment',
          name: 'First Payment',
          description: 'Made your first NETS payment',
          icon: '🎯',
          category: 'milestone',
          isUnlocked: transactionCount >= 1,
          unlockedAt: transactions?.[0]?.created_at
        },
        {
          id: 'streak-7',
          name: '7-Day Streak',
          description: 'Maintain a 7-day payment streak',
          icon: '🔥',
          category: 'streak',
          isUnlocked: userStreakCount >= 7,
          progress: Math.min(userStreakCount, 7),
          maxProgress: 7
        },
        {
          id: 'streak-30',
          name: '30-Day Streak',
          description: 'Maintain a 30-day payment streak',
          icon: '🌟',
          category: 'streak',
          isUnlocked: userStreakCount >= 30,
          progress: Math.min(userStreakCount, 30),
          maxProgress: 30
        },
        {
          id: 'streak-100',
          name: 'Centurion',
          description: 'Maintain a 100-day payment streak',
          icon: '👑',
          category: 'streak',
          isUnlocked: userStreakCount >= 100,
          progress: Math.min(userStreakCount, 100),
          maxProgress: 100
        },
        
        // Spending Badges
        {
          id: 'spender-100',
          name: 'First Century',
          description: 'Spend $100 using NETS',
          icon: '💰',
          category: 'spending',
          isUnlocked: userTotalSpent >= 100,
          progress: Math.min(userTotalSpent, 100),
          maxProgress: 100
        },
        {
          id: 'spender-500',
          name: 'Big Spender',
          description: 'Spend $500 using NETS',
          icon: '💎',
          category: 'spending',
          isUnlocked: userTotalSpent >= 500,
          progress: Math.min(userTotalSpent, 500),
          maxProgress: 500
        },
        {
          id: 'spender-1000',
          name: 'VIP Member',
          description: 'Spend $1,000 using NETS',
          icon: '🏆',
          category: 'spending',
          isUnlocked: userTotalSpent >= 1000,
          progress: Math.min(userTotalSpent, 1000),
          maxProgress: 1000
        },
        
        // Activity Badges
        {
          id: 'transactions-10',
          name: 'Getting Started',
          description: 'Complete 10 transactions',
          icon: '📱',
          category: 'activity',
          isUnlocked: transactionCount >= 10,
          progress: Math.min(transactionCount, 10),
          maxProgress: 10
        },
        {
          id: 'transactions-50',
          name: 'Regular User',
          description: 'Complete 50 transactions',
          icon: '⚡',
          category: 'activity',
          isUnlocked: transactionCount >= 50,
          progress: Math.min(transactionCount, 50),
          maxProgress: 50
        },
        {
          id: 'early-adopter',
          name: 'Early Adopter',
          description: 'One of the first 100 users',
          icon: '🚀',
          category: 'special',
          isUnlocked: true, // For demo purposes
          unlockedAt: '2024-01-01T00:00:00Z'
        }
      ];

      setBadges(allBadges);
    } catch (error) {
      console.error('Error fetching badges data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Award },
    { id: 'milestone', name: 'Milestones', icon: Target },
    { id: 'streak', name: 'Streaks', icon: Flame },
    { id: 'spending', name: 'Spending', icon: Star },
    { id: 'activity', name: 'Activity', icon: Users },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  const filteredBadges = activeCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === activeCategory);

  const unlockedCount = badges.filter(badge => badge.isUnlocked).length;

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading badges...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Badge Collection" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Progress Overview */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="text-center">
            <Award size={32} className="mx-auto mb-2" />
            <h2 className="text-xl font-bold mb-1">{unlockedCount}/{badges.length}</h2>
            <p className="text-blue-100">Badges Unlocked</p>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-hover'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Badges Grid */}
        <div className="space-y-4">
          {filteredBadges.map((badge) => (
            <Card 
              key={badge.id} 
              className={`p-4 transition-all ${
                badge.isUnlocked 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 animate-glow' 
                  : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-3xl ${badge.isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{badge.name}</h3>
                    {badge.isUnlocked && (
                      <Badge className="bg-gradient-gold text-white">Unlocked</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.description}
                  </p>
                  
                  {!badge.isUnlocked && badge.maxProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{badge.progress}/{badge.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(badge.progress || 0) / badge.maxProgress * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {badge.isUnlocked && badge.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <Card className="p-8 text-center">
            <Award className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No badges in this category</h3>
            <p className="text-muted-foreground">
              Try a different category to see more badges!
            </p>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Badges;