import { useState, useEffect } from 'react';
import { Share2, Users, Gift, Copy, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referee_email: string;
  status: string;
  reward_amount: number;
  created_at: string;
  completed_at: string | null;
}

const Referrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
      generateReferralCode();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (referralData) {
        setReferrals(referralData);
        
        // Calculate total earned from completed referrals
        const total = referralData
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + Number(r.reward_amount), 0);
        setTotalEarned(total);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    // Generate a unique referral code based on user ID
    if (user?.id) {
      const code = `NETS${user.id.substring(0, 8).toUpperCase()}`;
      setReferralCode(code);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `https://nets-everywhere.app/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied! 📋",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const shareViaEmail = () => {
    const subject = "Join me on NETS Everywhere - Get $10 bonus!";
    const body = `Hey! I've been using NETS Everywhere for all my payments and it's amazing! 

Sign up with my referral code ${referralCode} and we both get $10 bonus!

Download the app: https://nets-everywhere.app/signup?ref=${referralCode}

Happy payments! 💳✨`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const message = `🎉 Join me on NETS Everywhere! 

Use my referral code *${referralCode}* and we both get $10 bonus! 💰

Download: https://nets-everywhere.app/signup?ref=${referralCode}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading referrals...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Referral Program" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={20} />
              <span className="text-sm text-blue-100">Total Earned</span>
            </div>
            <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
          </Card>
          
          <Card className="p-4 bg-gradient-secondary text-white">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} />
              <span className="text-sm text-red-100">Referrals</span>
            </div>
            <div className="text-2xl font-bold">{referrals.length}</div>
          </Card>
        </div>

        {/* Referral Code */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Share2 className="text-primary" size={24} />
              <h3 className="text-lg font-semibold">Your Referral Code</h3>
            </div>
            
            <div className="p-4 bg-muted rounded-lg border-2 border-dashed border-primary/30">
              <div className="text-3xl font-bold text-primary tracking-wider">
                {referralCode}
              </div>
            </div>

            <Button 
              onClick={copyReferralLink}
              variant="outline" 
              className="w-full"
            >
              <Copy className="mr-2" size={16} />
              Copy Referral Link
            </Button>
          </div>
        </Card>

        {/* Share Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Share & Earn</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={shareViaEmail}
              variant="outline"
              className="h-16 flex-col gap-1"
            >
              <Mail size={20} />
              <span className="text-sm">Email</span>
            </Button>
            
            <Button 
              onClick={shareViaWhatsApp}
              variant="outline"
              className="h-16 flex-col gap-1"
            >
              <MessageSquare size={20} />
              <span className="text-sm">WhatsApp</span>
            </Button>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <h4 className="font-semibold mb-3 text-green-800">💰 How Referrals Work</h4>
          <div className="space-y-3 text-sm text-green-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xs">1</div>
              <div>
                <p className="font-medium">Share your code</p>
                <p>Send your unique referral code to friends and family</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xs">2</div>
              <div>
                <p className="font-medium">They sign up</p>
                <p>Your friend signs up using your referral code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xs">3</div>
              <div>
                <p className="font-medium">Both earn $10</p>
                <p>You both receive $10 bonus after their first transaction</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral History */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Referral History</h3>
          </div>
          
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {referral.referee_email || 'Friend'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Invited {formatDate(referral.created_at)}
                      {referral.completed_at && (
                        <span> • Completed {formatDate(referral.completed_at)}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${referral.reward_amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(referral.status)}>
                      {referral.status === 'completed' ? '✓ Earned' : '⏳ Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground">Share your code to start earning!</p>
            </div>
          )}
        </Card>

        {/* Terms */}
        <Card className="p-6 bg-muted/50">
          <h4 className="font-semibold mb-3">📋 Terms & Conditions</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• $10 bonus credited after referee's first transaction</li>
            <li>• No limit on number of referrals</li>
            <li>• Bonuses are credited within 24 hours</li>
            <li>• Referee must be a new NETS user</li>
            <li>• Subject to NETS Everywhere terms of service</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Referrals;