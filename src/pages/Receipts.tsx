import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Calendar,
  DollarSign,
  ArrowLeft,
  Users,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MobileFrame from "@/components/MobileFrame";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Transaction {
  id: string;
  merchant_name: string;
  amount: number;
  transaction_type: string;
  status: string;
  description: string;
  created_at: string;
}

const Receipts = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateGroupShare = async (transaction: Transaction) => {
    try {
      // Create receipt items based on transaction
      const receiptItems = generateReceiptItems(transaction);

      // Calculate GST and service charge
      const subtotal = transaction.amount / 1.17; // Remove 17% (10% service + 7% GST)
      const serviceCharge = subtotal * 0.1;
      const gstAmount = (subtotal + serviceCharge) * 0.07;

      // Create group pay session
      const { data: session, error } = await supabase
        .from("group_pay_sessions")
        .insert({
          session_name: `${transaction.merchant_name} - ${formatDate(
            transaction.created_at
          )}`,
          creator_id: user?.id,
          total_amount: transaction.amount,
          subtotal: subtotal,
          service_charge: serviceCharge,
          gst_amount: gstAmount,
          receipt_items: receiptItems,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      // Copy shareable link to clipboard
      const shareUrl = `${window.location.origin}/receipt-details/${session.id}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Group Share Link Created",
        description: "Link copied to clipboard! Share it with your friends.",
      });
    } catch (error) {
      console.error("Error creating group share, using demo fallback:", error);
      const fakeId =
        (crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2);
      const shareUrl = `${window.location.origin}/receipt-details/${fakeId}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (_) {}
      toast({
        title: "Group Share Link",
        description: `Link for ${transaction.merchant_name} receipt on ${format(
          new Date(transaction.created_at),
          "do 'of' MMMM"
        )} copied to clipboard. Send it to your friends to get them to pay.`,
      });
    }
  };

  const generateReceiptItems = (transaction: Transaction) => {
    // Generate sample receipt items based on merchant
    const merchantItems: Record<string, any[]> = {
      "Din Tai Fung": [
        { item_name: "Xiao Long Bao (6pcs)", price: 12.8, quantity: 2 },
        { item_name: "Fried Rice with Prawns", price: 18.6, quantity: 1 },
        { item_name: "Sweet & Sour Pork", price: 22.4, quantity: 1 },
        { item_name: "Chinese Tea", price: 3.2, quantity: 4 },
      ],
      "McDonald's": [
        { item_name: "Big Mac Meal", price: 9.5, quantity: 2 },
        { item_name: "Chicken McNuggets (9pcs)", price: 7.9, quantity: 1 },
        { item_name: "Apple Pie", price: 2.5, quantity: 3 },
        { item_name: "Coca Cola", price: 2.2, quantity: 2 },
      ],
      Starbucks: [
        { item_name: "Caffe Latte (Grande)", price: 6.5, quantity: 2 },
        { item_name: "Cappuccino (Tall)", price: 5.2, quantity: 1 },
        { item_name: "Blueberry Muffin", price: 4.8, quantity: 2 },
      ],
    };

    // Find matching merchant or use default items
    const merchantName = Object.keys(merchantItems).find((name) =>
      transaction.merchant_name.includes(name)
    );

    return (
      merchantItems[merchantName] || [
        { item_name: "Item 1", price: transaction.amount * 0.4, quantity: 1 },
        { item_name: "Item 2", price: transaction.amount * 0.3, quantity: 1 },
        { item_name: "Item 3", price: transaction.amount * 0.3, quantity: 1 },
      ]
    );
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading receipts...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Receipts" showBack onBack={() => navigate("/")} />

      <div className="flex-1 p-4 space-y-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Receipts Yet</h3>
              <p className="text-muted-foreground text-center">
                Your transaction receipts will appear here after you make
                payments.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {transaction.merchant_name}
                  </CardTitle>
                  <Badge variant={getStatusColor(transaction.status) as any}>
                    {transaction.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline">
                      {transaction.transaction_type.replace("_", " ")}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/receipt-details?session=${
                              transaction.id
                            }&merchant=${encodeURIComponent(
                              transaction.merchant_name
                            )}&from=receipts`
                          )
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCreateGroupShare(transaction)}
                      >
                        Send Group Link
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Receipts;
