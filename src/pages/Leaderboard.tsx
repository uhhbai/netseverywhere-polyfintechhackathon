import { useState, useEffect } from 'react';
import { Crown, Medal, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaderboardUser {
  id: string;
  display_name: string;
  streak_count: number;
  total_spent: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'streak' | 'spending'>('streak');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      const orderBy = activeTab === 'streak' ? 'streak_count' : 'total_spent';
      
      // First, ensure demo users are seeded
      await supabase.rpc('seed_demo_users');
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, streak_count, total_spent')
        .order(orderBy, { ascending: false })
        .limit(50);

      if (profiles) {
        const leaderboardData = profiles.map((profile, index) => ({
          id: profile.user_id,
          display_name: profile.display_name || 'Anonymous User',
          streak_count: profile.streak_count || 0,
          total_spent: profile.total_spent || 0,
          rank: index + 1
        }));

        setLeaderboard(leaderboardData);

        // Find current user's rank
        const currentUserRank = leaderboardData.find(u => u.id === user?.id)?.rank;
        setUserRank(currentUserRank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-gold';
      case 2:
        return 'bg-gradient-to-r from-gray-200 to-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-200 to-amber-300';
      default:
        return 'bg-surface';
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Leaderboard" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Tab Selector */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('streak')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              activeTab === 'streak' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            <TrendingUp size={16} />
            Streak
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              activeTab === 'spending' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            <Users size={16} />
            Spending
          </button>
        </div>

        {/* User's Rank */}
        {userRank && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankIcon(userRank)}
                <div>
                  <p className="font-medium">Your Rank</p>
                  <p className="text-sm text-muted-foreground">#{userRank} out of {leaderboard.length}</p>
                </div>
              </div>
              <Badge variant="secondary">
                {activeTab === 'streak' 
                  ? `${leaderboard.find(u => u.id === user?.id)?.streak_count || 0} days`
                  : `$${(leaderboard.find(u => u.id === user?.id)?.total_spent || 0).toFixed(2)}`
                }
              </Badge>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((leaderUser) => (
            <Card 
              key={leaderUser.id} 
              className={`p-4 ${getRankBg(leaderUser.rank)} ${
                leaderUser.id === user?.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(leaderUser.rank)}
                  <div>
                    <p className="font-medium">
                      {leaderUser.display_name}
                      {leaderUser.id === user?.id && (
                        <span className="text-primary ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'streak' 
                        ? `${leaderUser.streak_count} day streak`
                        : `$${leaderUser.total_spent.toFixed(2)} total spent`
                      }
                    </p>
                  </div>
                </div>
                
                {leaderUser.rank <= 3 && (
                  <Badge 
                    variant={leaderUser.rank === 1 ? "default" : "secondary"}
                    className={leaderUser.rank === 1 ? "bg-yellow-500" : ""}
                  >
                    Top {leaderUser.rank}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">
              Start making payments to appear on the leaderboard!
            </p>
          </Card>
        )}

        {/* Leaderboard Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">🏆 How Rankings Work</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• <strong>Streak:</strong> Consecutive days with NETS payments</li>
            <li>• <strong>Spending:</strong> Total amount spent using NETS</li>
            <li>• Rankings update in real-time</li>
            <li>• Compete with friends and climb the leaderboard!</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Leaderboard;