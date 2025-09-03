import { useState, useEffect } from "react";
import { Gift, Star, Coffee, ShoppingBag, Smartphone, Utensils, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MobileFrame from "@/components/MobileFrame";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  offers: BrandOffer[];
}

interface BrandOffer {
  id: string;
  points_required: number;
  discount_value: number;
  discount_type: '$' | '%';
  description: string;
  terms: string;
}

interface RedeemedCode {
  id: string;
  brand: string;
  offer: string;
  code: string;
  redeemed_at: string;
  expires_at: string;
  used: boolean;
}

const PointsRedemption = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemedCodes, setRedeemedCodes] = useState<RedeemedCode[]>([]);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<RedeemedCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const brands: Brand[] = [
    {
      id: "starbucks",
      name: "Starbucks",
      logo: "☕",
      category: "Food & Beverage",
      offers: [
        {
          id: "sb1",
          points_required: 5000,
          discount_value: 5,
          discount_type: '$',
          description: "$5 off your next order",
          terms: "Valid for 30 days. Minimum spend $10. One use only."
        },
        {
          id: "sb2", 
          points_required: 10000,
          discount_value: 15,
          discount_type: '$',
          description: "$15 off your next order",
          terms: "Valid for 30 days. Minimum spend $25. One use only."
        }
      ]
    },
    {
      id: "shopee",
      name: "Shopee",
      logo: "🛒",
      category: "E-commerce",
      offers: [
        {
          id: "sp1",
          points_required: 8000,
          discount_value: 10,
          discount_type: '%',
          description: "10% off your next purchase",
          terms: "Valid for 14 days. Max discount $20. One use only."
        },
        {
          id: "sp2",
          points_required: 15000,
          discount_value: 25,
          discount_type: '$',
          description: "$25 off your next purchase", 
          terms: "Valid for 14 days. Minimum spend $50. One use only."
        }
      ]
    },
    {
      id: "grab",
      name: "Grab",
      logo: "🚗",
      category: "Transport & Food",
      offers: [
        {
          id: "gb1",
          points_required: 6000,
          discount_value: 8,
          discount_type: '$',
          description: "$8 off GrabFood orders",
          terms: "Valid for 21 days. Minimum spend $15. One use only."
        },
        {
          id: "gb2",
          points_required: 12000,
          discount_value: 20,
          discount_type: '$',
          description: "$20 off any Grab service",
          terms: "Valid for 21 days. Minimum spend $30. One use only."
        }
      ]
    },
    {
      id: "uniqlo",
      name: "Uniqlo",
      logo: "👕",
      category: "Fashion",
      offers: [
        {
          id: "uq1",
          points_required: 9000,
          discount_value: 15,
          discount_type: '%',
          description: "15% off your purchase",
          terms: "Valid for 30 days. Max discount $30. One use only."
        },
        {
          id: "uq2",
          points_required: 18000,
          discount_value: 50,
          discount_type: '$',
          description: "$50 off your purchase",
          terms: "Valid for 30 days. Minimum spend $100. One use only."
        }
      ]
    }
  ];

  useEffect(() => {
    fetchUserPoints();
    fetchRedeemedCodes();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profile) {
        setUserPoints(profile.points || 0);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedeemedCodes = async () => {
    // Mock redeemed codes - in a real app this would come from database
    const mockCodes: RedeemedCode[] = [
      {
        id: "1",
        brand: "Starbucks",
        offer: "$5 off your next order",
        code: "SB5OFF2024",
        redeemed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        used: false
      },
      {
        id: "2", 
        brand: "Shopee",
        offer: "10% off your next purchase",
        code: "SHOP10PCT",
        redeemed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        used: true
      }
    ];
    setRedeemedCodes(mockCodes);
  };

  const generateDiscountCode = (brand: string, offer: BrandOffer): string => {
    const brandCode = brand.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${brandCode}${random}`;
  };

  const handleRedeem = async (brand: Brand, offer: BrandOffer) => {
    if (userPoints < offer.points_required) {
      toast({
        title: "Insufficient Points",
        description: `You need ${offer.points_required} points to redeem this offer`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(offer.id);
    
    try {
      // Deduct points from user profile
      const newPoints = userPoints - offer.points_required;
      await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("user_id", user?.id);

      // Generate discount code
      const discountCode = generateDiscountCode(brand.name, offer);
      
      // Create new redeemed code
      const newRedeemedCode: RedeemedCode = {
        id: Date.now().toString(),
        brand: brand.name,
        offer: offer.description,
        code: discountCode,
        redeemed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        used: false
      };

      setRedeemedCodes(prev => [newRedeemedCode, ...prev]);
      setUserPoints(newPoints);
      setSelectedCode(newRedeemedCode);
      setShowCodeDialog(true);

      toast({
        title: "Redemption Successful! 🎉",
        description: `Redeemed ${offer.description} for ${offer.points_required} points`,
      });

    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Code Copied!",
        description: "Discount code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading rewards...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Points Redemption" />

      <div className="p-6 space-y-6 pb-24">
        {/* Points Balance */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="text-yellow-300" size={24} />
              <h2 className="text-xl font-bold">Your Points</h2>
            </div>
            <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
            <p className="text-sm opacity-90">Earn more points with every transaction</p>
          </div>
        </Card>

        {/* Brand Offers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Rewards</h3>
          
          {brands.map((brand) => (
            <Card key={brand.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{brand.logo}</div>
                <div>
                  <h4 className="font-semibold text-lg">{brand.name}</h4>
                  <p className="text-sm text-muted-foreground">{brand.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                {brand.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 border border-card-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{offer.description}</p>
                        <p className="text-sm text-muted-foreground">{offer.terms}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="text-yellow-500" size={16} />
                          <span className="font-semibold">{offer.points_required.toLocaleString()}</span>
                        </div>
                        <Button
                          onClick={() => handleRedeem(brand, offer)}
                          disabled={userPoints < offer.points_required || redeeming === offer.id}
                          size="sm"
                          className="h-8"
                        >
                          {redeeming === offer.id ? "Redeeming..." : "Redeem"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* My Codes */}
        {redeemedCodes.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="text-primary" size={24} />
              <h3 className="text-lg font-semibold">My Discount Codes</h3>
            </div>

            <div className="space-y-3">
              {redeemedCodes.map((code) => (
                <div
                  key={code.id}
                  className={`p-4 border rounded-lg ${
                    code.used ? "bg-muted opacity-60" : isExpiringSoon(code.expires_at) ? "border-orange-200 bg-orange-50" : "border-card-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{code.brand}</p>
                      <p className="text-sm text-muted-foreground">{code.offer}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(code.expires_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {code.used ? (
                        <Badge variant="secondary">Used</Badge>
                      ) : isExpiringSoon(code.expires_at) ? (
                        <Badge className="bg-orange-500">Expiring Soon</Badge>
                      ) : (
                        <Badge className="bg-success">Active</Badge>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedCode(code);
                          setShowCodeDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-7"
                      >
                        View Code
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* How to Earn Points */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <h4 className="font-semibold mb-3 text-green-800">💰 How to Earn Points</h4>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Earn 100 points for every $1 spent using NETS</li>
            <li>• Get bonus points for completing challenges</li>
            <li>• Earn 1000 points for each successful referral</li>
            <li>• Maintain payment streaks for bonus multipliers</li>
            <li>• Special promotions offer double or triple points</li>
          </ul>
        </Card>
      </div>

      {/* Code Display Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedCode?.brand} Discount Code</DialogTitle>
          </DialogHeader>
          
          {selectedCode && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{selectedCode.offer}</p>
                <div className="p-4 bg-muted rounded-lg border-2 border-dashed border-primary">
                  <p className="font-mono text-lg font-bold text-primary">{selectedCode.code}</p>
                </div>
              </div>

              <Button
                onClick={() => copyToClipboard(selectedCode.code)}
                className="w-full"
                variant={copiedCode === selectedCode.code ? "secondary" : "default"}
              >
                {copiedCode === selectedCode.code ? (
                  <>
                    <Check className="mr-2" size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2" size={16} />
                    Copy Code
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Code expires on {formatDate(selectedCode.expires_at)}</p>
                <p>• Single use only</p>
                <p>• Cannot be combined with other offers</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default PointsRedemption;