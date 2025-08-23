import { useState, useEffect } from 'react';
import { Target, Clock, Gift, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  reward_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current_progress?: number;
  is_completed?: boolean;
}

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      // Fetch active challenges
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengeData) {
        // Fetch user progress for each challenge
        const challengesWithProgress = await Promise.all(
          challengeData.map(async (challenge) => {
            const { data: progressData } = await supabase
              .from('user_challenge_progress')
              .select('current_progress, is_completed')
              .eq('user_id', user?.id)
              .eq('challenge_id', challenge.id)
              .single();

            return {
              ...challenge,
              current_progress: progressData?.current_progress || 0,
              is_completed: progressData?.is_completed || false
            };
          })
        );

        setChallenges(challengesWithProgress);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user?.id,
          challenge_id: challengeId,
          current_progress: 0,
          is_completed: false
        });

      if (error) throw error;

      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined this challenge. Good luck!",
      });

      fetchChallenges(); // Refresh data
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'spending':
        return '💰';
      case 'transactions':
        return '📱';
      case 'streak':
        return '🔥';
      case 'social':
        return '👥';
      default:
        return '🎯';
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading challenges...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Time-Limited Challenges" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Active Challenges */}
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progressPercentage = Math.min((challenge.current_progress || 0) / challenge.target_value * 100, 100);
            const daysRemaining = getDaysRemaining(challenge.end_date);
            const hasJoined = challenge.current_progress !== undefined;
            
            return (
              <Card 
                key={challenge.id} 
                className={`p-6 ${challenge.is_completed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getChallengeIcon(challenge.challenge_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    
                    {challenge.is_completed && (
                      <Badge className="bg-success text-white">
                        <Trophy size={12} className="mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  {hasJoined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.current_progress}/{challenge.target_value}</span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="h-3"
                      />
                    </div>
                  )}

                  {/* Rewards & Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {challenge.reward_points > 0 && (
                        <div className="flex items-center gap-1">
                          <Gift className="text-primary" size={16} />
                          <span>{challenge.reward_points} pts</span>
                        </div>
                      )}
                      {challenge.reward_amount > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-success">💰 ${challenge.reward_amount}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={16} />
                      {isExpired(challenge.end_date) ? (
                        <span className="text-error">Expired</span>
                      ) : (
                        <span>{daysRemaining} days left</span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!hasJoined && !isExpired(challenge.end_date) && (
                    <Button 
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full"
                    >
                      Join Challenge
                    </Button>
                  )}
                  
                  {hasJoined && !challenge.is_completed && !isExpired(challenge.end_date) && (
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-primary font-medium">Challenge Active!</p>
                      <p className="text-sm text-muted-foreground">
                        Keep going to complete this challenge
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <Card className="p-8 text-center">
            <Target className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
            <p className="text-muted-foreground">
              Check back soon for new exciting challenges!
            </p>
          </Card>
        )}

        {/* Challenge Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">🏆 How Challenges Work</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Join challenges to earn bonus rewards and points</li>
            <li>• Complete objectives within the time limit</li>
            <li>• Track your progress in real-time</li>
            <li>• Earn exclusive badges for completed challenges</li>
            <li>• New challenges added weekly!</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Challenges;