import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

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

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Header 
        title="Receipts" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="flex-1 p-4 space-y-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Receipts Yet</h3>
              <p className="text-muted-foreground text-center">
                Your transaction receipts will appear here after you make payments.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-4"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{transaction.merchant_name}</CardTitle>
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
                      {transaction.transaction_type.replace('_', ' ')}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {transaction.merchant_name.includes('Din Tai Fung') && (
                        <Button variant="default" size="sm" onClick={() => navigate('/grouppay')}>
                          Split Bill
                        </Button>
                      )}
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