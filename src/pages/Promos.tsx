import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, Calendar, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface Promo {
  id: string;
  title: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  merchant_name: string;
  image_url: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  promo_code: string;
  is_active: boolean;
}

const Promos = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const usePromo = async (promo: Promo) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to use promos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already used this promo
      const { data: existingUsage } = await supabase
        .from('user_promo_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('promo_id', promo.id)
        .single();

      if (existingUsage) {
        toast({
          title: "Already Used",
          description: "You have already used this promo.",
          variant: "destructive"
        });
        return;
      }

      // Create usage record
      const { error } = await supabase
        .from('user_promo_usage')
        .insert({
          user_id: user.id,
          promo_id: promo.id,
          savings_amount: promo.discount_amount || 0
        });

      if (error) throw error;

      // Copy promo code to clipboard
      if (promo.promo_code) {
        await navigator.clipboard.writeText(promo.promo_code);
        toast({
          title: "Promo Activated!",
          description: `Code ${promo.promo_code} copied to clipboard.`
        });
      } else {
        toast({
          title: "Promo Activated!",
          description: "Promo has been applied to your account."
        });
      }
    } catch (error) {
      console.error('Error using promo:', error);
      toast({
        title: "Error",
        description: "Failed to activate promo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isFullyUsed = (currentUses: number, maxUses: number) => {
    return currentUses >= maxUses;
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading promos...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header 
        title="Exclusive Promos" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="flex-1 p-4 space-y-4">
        {promos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Promos Available</h3>
              <p className="text-muted-foreground text-center">
                Check back later for exclusive deals and discounts.
              </p>
            </CardContent>
          </Card>
        ) : (
          promos.map((promo) => {
            const expired = isExpired(promo.valid_until);
            const fullyUsed = isFullyUsed(promo.current_uses, promo.max_uses);
            const canUse = !expired && !fullyUsed;

            return (
              <Card key={promo.id} className={`card-hover ${!canUse ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{promo.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {promo.merchant_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {promo.discount_percentage ? (
                        <Badge variant="secondary" className="bg-accent">
                          <Percent className="h-3 w-3 mr-1" />
                          {promo.discount_percentage}% OFF
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-accent">
                          ${promo.discount_amount} OFF
                        </Badge>
                      )}
                      {expired && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {fullyUsed && (
                        <Badge variant="destructive">Sold Out</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{promo.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Valid until {new Date(promo.valid_until).toLocaleDateString()}
                      </div>
                      <span>{promo.current_uses}/{promo.max_uses} used</span>
                    </div>

                    {promo.promo_code && (
                      <div className="bg-muted p-2 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{promo.promo_code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(promo.promo_code);
                              toast({ title: "Code copied!" });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => usePromo(promo)}
                      disabled={!canUse}
                      className="w-full"
                    >
                      {expired ? 'Expired' : fullyUsed ? 'Sold Out' : 'Use Promo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Promos;