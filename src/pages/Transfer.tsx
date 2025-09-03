import { useState, useEffect } from "react";
import { Send, CreditCard, Users, Clock, ChevronRight, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MobileFrame from "@/components/MobileFrame";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecentTransfer {
  id: string;
  recipient: string;
  amount: number;
  created_at: string;
  type: 'p2p' | 'card';
}

const Transfer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([]);
  
  // P2P Transfer States
  const [p2pAmount, setP2pAmount] = useState("");
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pDiscountCode, setP2pDiscountCode] = useState("");
  
  // Card Transfer States
  const [cardAmount, setCardAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("DBS Debit Card");
  const [cardDiscountCode, setCardDiscountCode] = useState("");

  const mockCards = [
    "DBS Debit Card •••• 1234",
    "OCBC Credit Card •••• 5678", 
    "UOB Debit Card •••• 9012"
  ];

  useEffect(() => {
    fetchRecentTransfers();
  }, []);

  const fetchRecentTransfers = async () => {
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .in("transaction_type", ["p2p_transfer", "card_transfer"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (transactions) {
        const transfers = transactions.map((t) => ({
          id: t.id,
          recipient: t.description || "Unknown",
          amount: Number(t.amount),
          created_at: t.created_at,
          type: t.transaction_type === "p2p_transfer" ? "p2p" as const : "card" as const,
        }));
        setRecentTransfers(transfers);
      }
    } catch (error) {
      console.error("Error fetching recent transfers:", error);
    }
  };

  const handleP2PTransfer = async () => {
    if (!p2pAmount || !p2pRecipient) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalAmount = parseFloat(p2pAmount);
      let discountApplied = false;

      // Apply discount if code provided
      if (p2pDiscountCode.trim()) {
        if (p2pDiscountCode.toUpperCase() === "SAVE10") {
          finalAmount = finalAmount * 0.9; // 10% discount
          discountApplied = true;
        }
      }

      // Insert transaction
      await supabase.from("transactions").insert({
        user_id: user?.id,
        merchant_name: "eNets Transfer",
        amount: finalAmount,
        transaction_type: "p2p_transfer",
        description: `P2P to ${p2pRecipient}`,
      });

      toast({
        title: "Transfer Successful! 💸",
        description: `Sent $${finalAmount.toFixed(2)} to ${p2pRecipient}${discountApplied ? " (10% discount applied)" : ""}`,
      });

      // Reset form
      setP2pAmount("");
      setP2pRecipient("");
      setP2pDiscountCode("");
      
      fetchRecentTransfers();
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardTransfer = async () => {
    if (!cardAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter transfer amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalAmount = parseFloat(cardAmount);
      let discountApplied = false;

      // Apply discount if code provided
      if (cardDiscountCode.trim()) {
        if (cardDiscountCode.toUpperCase() === "TRANSFER5") {
          finalAmount = finalAmount * 0.95; // 5% discount
          discountApplied = true;
        }
      }

      // Insert transaction
      await supabase.from("transactions").insert({
        user_id: user?.id,
        merchant_name: "Card Transfer",
        amount: finalAmount,
        transaction_type: "card_transfer",
        description: `From ${selectedCard}`,
      });

      toast({
        title: "Transfer Successful! 💳",
        description: `Transferred $${finalAmount.toFixed(2)} from ${selectedCard}${discountApplied ? " (5% discount applied)" : ""}`,
      });

      // Reset form
      setCardAmount("");
      setCardDiscountCode("");
      
      fetchRecentTransfers();
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MobileFrame>
      <Header title="eNets Transfer" />

      <div className="p-6 space-y-6 pb-24">
        <Tabs defaultValue="p2p" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="p2p" className="flex items-center gap-2">
              <Users size={16} />
              P2P Transfer
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard size={16} />
              Card Transfer
            </TabsTrigger>
          </TabsList>

          {/* P2P Transfer */}
          <TabsContent value="p2p">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Send className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Send Money</h3>
                    <p className="text-sm text-muted-foreground">Transfer to friends instantly</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="p2p-recipient">Recipient</Label>
                    <Input
                      id="p2p-recipient"
                      placeholder="Enter name or phone number"
                      value={p2pRecipient}
                      onChange={(e) => setP2pRecipient(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="p2p-amount">Amount (SGD)</Label>
                    <Input
                      id="p2p-amount"
                      type="number"
                      placeholder="0.00"
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="p2p-discount">Discount Code (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="p2p-discount"
                        placeholder="Enter discount code (e.g., SAVE10)"
                        value={p2pDiscountCode}
                        onChange={(e) => setP2pDiscountCode(e.target.value)}
                        className="pr-10"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    </div>
                  </div>

                  <Button
                    onClick={handleP2PTransfer}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-primary"
                  >
                    <Send className="mr-2" size={18} />
                    {loading ? "Processing..." : "Send Money"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Card Transfer */}
          <TabsContent value="card">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <CreditCard className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Top Up Wallet</h3>
                    <p className="text-sm text-muted-foreground">Transfer from your linked cards</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-select">Select Card</Label>
                    <div className="space-y-2">
                      {mockCards.map((card) => (
                        <div
                          key={card}
                          onClick={() => setSelectedCard(card)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedCard === card
                              ? "border-primary bg-primary/5"
                              : "border-card-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{card}</span>
                            {selectedCard === card && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="card-amount">Amount (SGD)</Label>
                    <Input
                      id="card-amount"
                      type="number"
                      placeholder="0.00"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-discount">Discount Code (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="card-discount"
                        placeholder="Enter discount code (e.g., TRANSFER5)"
                        value={cardDiscountCode}
                        onChange={(e) => setCardDiscountCode(e.target.value)}
                        className="pr-10"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    </div>
                  </div>

                  <Button
                    onClick={handleCardTransfer}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-secondary"
                  >
                    <CreditCard className="mr-2" size={18} />
                    {loading ? "Processing..." : "Transfer to Wallet"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Transfers */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Recent Transfers</h3>
          </div>

          {recentTransfers.length > 0 ? (
            <div className="space-y-3">
              {recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transfer.type === 'p2p' ? 'bg-gradient-primary' : 'bg-gradient-secondary'
                    }`}>
                      {transfer.type === 'p2p' ? (
                        <Send className="text-white" size={16} />
                      ) : (
                        <CreditCard className="text-white" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transfer.recipient}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transfer.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${transfer.amount.toFixed(2)}</p>
                    <Badge className="bg-success text-white">
                      {transfer.type === 'p2p' ? 'Sent' : 'Topped Up'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No recent transfers</p>
              <p className="text-sm text-muted-foreground">
                Start transferring money to see your history
              </p>
            </div>
          )}
        </Card>

        {/* Transfer Tips */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">💡 Transfer Tips</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• P2P transfers are instant and free between NETS users</li>
            <li>• Card transfers may take 1-3 business days to process</li>
            <li>• Use discount codes to save on transfer fees</li>
            <li>• Check recipient details before confirming transfer</li>
            <li>• Daily transfer limits apply for security</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Transfer;