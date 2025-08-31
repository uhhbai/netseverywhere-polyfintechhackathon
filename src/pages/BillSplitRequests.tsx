import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Receipt, Clock, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  id: string;
  session_name: string;
  requester_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  restaurant: string;
  session_id: string;
}

const BillSplitRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentRequests();
    }
  }, [user]);

  const fetchPaymentRequests = async () => {
    try {
      // Demo payment requests data
      const demoRequests: PaymentRequest[] = [
        {
          id: '1',
          session_name: 'Din Tai Fung Dinner',
          requester_name: 'Sarah Chen',
          amount: 18.50,
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          restaurant: 'Din Tai Fung',
          session_id: 'demo-1'
        },
        {
          id: '2',
          session_name: 'McDonald\'s Lunch',
          requester_name: 'Alex Kumar',
          amount: 12.50,
          status: 'approved',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          restaurant: 'McDonald\'s',
          session_id: 'demo-2'
        },
        {
          id: '3',
          session_name: 'Starbucks Coffee Run',
          requester_name: 'Emily Tan',
          amount: 8.90,
          status: 'paid',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          restaurant: 'Starbucks',
          session_id: 'demo-3'
        }
      ];

      setRequests(demoRequests);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-white';
      case 'approved':
        return 'bg-primary text-white';
      case 'paid':
        return 'bg-success text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <Receipt size={16} />;
      case 'paid':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      )
    );
    
    toast({
      title: "Request Approved! ✓",
      description: "Payment request has been approved. Ready to pay.",
    });
  };

  const handlePayRequest = (requestId: string, amount: number) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'paid' as const } : req
      )
    );
    
    toast({
      title: "Payment Successful! 💳",
      description: `Paid $${amount.toFixed(2)} successfully.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const paidRequests = requests.filter(r => r.status === 'paid');

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading payment requests...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Bill Split Requests" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-warning">{pendingRequests.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-primary">{approvedRequests.length}</div>
            <div className="text-xs text-muted-foreground">To Pay</div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-success">{paidRequests.length}</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-warning" size={20} />
              Pending Approval
            </h3>
            
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4 border-warning/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{request.session_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Request from {request.requester_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-warning">
                      ${request.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(request.status)}>
                      <Clock size={12} className="mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{request.restaurant}</span>
                  <span>{formatDate(request.created_at)}</span>
                </div>
                
                <Button 
                  onClick={() => handleApproveRequest(request.id)}
                  className="w-full bg-warning hover:bg-warning/90 text-white"
                >
                  Approve Request
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Approved Requests (Ready to Pay) */}
        {approvedRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="text-primary" size={20} />
              Ready to Pay
            </h3>
            
            {approvedRequests.map((request) => (
              <Card key={request.id} className="p-4 border-primary/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{request.session_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Request from {request.requester_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${request.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(request.status)}>
                      <Receipt size={12} className="mr-1" />
                      Approved
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{request.restaurant}</span>
                  <span>{formatDate(request.created_at)}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/receipt-details?session=${request.session_id}&merchant=${encodeURIComponent(request.restaurant)}`)}
                    className="flex-1"
                  >
                    View Receipt
                  </Button>
                  <Button 
                    onClick={() => handlePayRequest(request.id, request.amount)}
                    className="flex-1"
                  >
                    <DollarSign size={16} className="mr-1" />
                    Pay Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Paid Requests */}
        {paidRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />
              Completed Payments
            </h3>
            
            {paidRequests.map((request) => (
              <Card key={request.id} className="p-4 bg-success/5 border-success/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.session_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid to {request.requester_name} • {formatDate(request.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">
                      ${request.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(request.status)}>
                      <CheckCircle size={12} className="mr-1" />
                      Paid
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Payment Requests</h3>
            <p className="text-muted-foreground">
              When friends request payment for split bills, they'll appear here.
            </p>
          </Card>
        )}

        {/* Help Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">💡 How Bill Splitting Works</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Friends send you payment requests after splitting bills</li>
            <li>• Review and approve requests before paying</li>
            <li>• View receipt details to verify your items</li>
            <li>• Pay directly through the app with one tap</li>
            <li>• All payments are secure and instant</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default BillSplitRequests;