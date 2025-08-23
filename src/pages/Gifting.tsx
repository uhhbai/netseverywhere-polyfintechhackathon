import { useState, useEffect } from 'react';
import { Gift, Heart, Calendar, Users, Send, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface GiftOccasion {
  id: string;
  name: string;
  emoji: string;
  suggestedAmount: number;
  description: string;
}

interface SentGift {
  id: string;
  recipient_name: string;
  amount: number;
  occasion: string;
  message: string;
  created_at: string;
  status: string;
}

const Gifting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sentGifts, setSentGifts] = useState<SentGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<GiftOccasion | null>(null);
  const [giftAmount, setGiftAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  const occasions: GiftOccasion[] = [
    {
      id: 'birthday',
      name: 'Birthday',
      emoji: '🎂',
      suggestedAmount: 50,
      description: 'Celebrate someone special'
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      emoji: '💝',
      suggestedAmount: 100,
      description: 'Mark a special milestone'
    },
    {
      id: 'wedding',
      name: 'Wedding',
      emoji: '💒',
      suggestedAmount: 150,
      description: 'Congratulate the happy couple'
    },
    {
      id: 'graduation',
      name: 'Graduation',
      emoji: '🎓',
      suggestedAmount: 75,
      description: 'Celebrate academic achievement'
    },
    {
      id: 'holiday',
      name: 'Holiday',
      emoji: '🎄',
      suggestedAmount: 40,
      description: 'Spread holiday cheer'
    },
    {
      id: 'thank-you',
      name: 'Thank You',
      emoji: '🙏',
      suggestedAmount: 25,
      description: 'Show your appreciation'
    },
    {
      id: 'just-because',
      name: 'Just Because',
      emoji: '✨',
      suggestedAmount: 30,
      description: 'No reason needed'
    },
    {
      id: 'new-job',
      name: 'New Job',
      emoji: '💼',
      suggestedAmount: 60,
      description: 'Congratulate career success'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchSentGifts();
    }
  }, [user]);

  const fetchSentGifts = async () => {
    try {
      // Simulate fetching sent gifts from transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('transaction_type', 'gift')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactions) {
        const gifts = transactions.map(t => ({
          id: t.id,
          recipient_name: t.description?.split('to ')[1] || 'Someone Special',
          amount: Number(t.amount),
          occasion: t.description?.split(' gift')[0] || 'Gift',
          message: 'Hope you enjoy this gift!',
          created_at: t.created_at,
          status: t.status
        }));
        setSentGifts(gifts);
      }
    } catch (error) {
      console.error('Error fetching sent gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendGift = async () => {
    if (!selectedOccasion || !giftAmount || !recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          merchant_name: 'NETS Gifting',
          amount: Number(giftAmount),
          transaction_type: 'gift',
          description: `${selectedOccasion.name} gift to ${recipientName}`,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Gift Sent! 🎁",
        description: `Your ${selectedOccasion.name.toLowerCase()} gift has been sent to ${recipientName}.`,
      });

      // Reset form
      setShowGiftForm(false);
      setSelectedOccasion(null);
      setGiftAmount('');
      setRecipientName('');
      setGiftMessage('');
      
      fetchSentGifts(); // Refresh list
    } catch (error) {
      console.error('Error sending gift:', error);
      toast({
        title: "Error",
        description: "Failed to send gift. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading gifting...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Occasion-based Gifting" />
      
      <div className="p-6 space-y-6 pb-24">
        {!showGiftForm ? (
          <>
            {/* Send New Gift Button */}
            <Button 
              onClick={() => setShowGiftForm(true)}
              className="w-full h-14 text-lg bg-gradient-primary"
            >
              <Plus className="mr-2" size={20} />
              Send a Gift
            </Button>

            {/* Occasion Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Occasions</h3>
              <div className="grid grid-cols-2 gap-3">
                {occasions.slice(0, 6).map((occasion) => (
                  <button
                    key={occasion.id}
                    onClick={() => {
                      setSelectedOccasion(occasion);
                      setGiftAmount(occasion.suggestedAmount.toString());
                      setShowGiftForm(true);
                    }}
                    className="p-4 bg-muted rounded-lg hover:bg-hover transition-all text-left"
                  >
                    <div className="text-2xl mb-1">{occasion.emoji}</div>
                    <div className="font-medium text-sm">{occasion.name}</div>
                    <div className="text-xs text-muted-foreground">${occasion.suggestedAmount}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Gifts */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Send className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">Recent Gifts Sent</h3>
              </div>
              
              {sentGifts.length > 0 ? (
                <div className="space-y-3">
                  {sentGifts.map((gift) => (
                    <div key={gift.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Gift className="text-white" size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{gift.recipient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {gift.occasion} • {new Date(gift.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${gift.amount.toFixed(2)}</p>
                        <Badge variant={gift.status === 'completed' ? 'default' : 'secondary'}>
                          {gift.status === 'completed' ? 'Sent' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No gifts sent yet</p>
                  <p className="text-sm text-muted-foreground">Send your first gift to get started!</p>
                </div>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Gift Form */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Send a Gift</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowGiftForm(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Occasion Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Select Occasion</label>
                  <div className="grid grid-cols-2 gap-2">
                    {occasions.map((occasion) => (
                      <button
                        key={occasion.id}
                        onClick={() => {
                          setSelectedOccasion(occasion);
                          setGiftAmount(occasion.suggestedAmount.toString());
                        }}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedOccasion?.id === occasion.id
                            ? 'border-primary bg-primary/10'
                            : 'border-card-border hover:border-hover'
                        }`}
                      >
                        <div className="text-lg mb-1">{occasion.emoji}</div>
                        <div className="font-medium text-sm">{occasion.name}</div>
                        <div className="text-xs text-muted-foreground">${occasion.suggestedAmount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gift Amount */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gift Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's name"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Personal Message (Optional)</label>
                  <Input
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Add a personal message..."
                  />
                </div>

                {/* Send Button */}
                <Button 
                  onClick={sendGift}
                  className="w-full h-12 bg-gradient-primary"
                >
                  <Gift className="mr-2" size={18} />
                  Send Gift ${giftAmount || '0.00'}
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Gifting Tips */}
        <Card className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
          <h4 className="font-semibold mb-3 text-pink-800">🎁 Gifting Tips</h4>
          <ul className="space-y-2 text-sm text-pink-700">
            <li>• Choose meaningful occasions to make gifts more special</li>
            <li>• Add personal messages to show you care</li>
            <li>• Recipients receive gifts instantly via NETS</li>
            <li>• Track all your sent gifts in one place</li>
            <li>• No fees for sending gifts to other NETS users</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Gifting;