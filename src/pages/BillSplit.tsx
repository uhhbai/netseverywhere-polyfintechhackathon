import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  id: string;
  requesterName: string;
  restaurantName: string;
  amount: number;
  status: 'pending' | 'selected' | 'paid' | 'rejected';
  requestedAt: string;
  description: string;
  sessionId: string;
}

const BillSplit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([
    {
      id: '1',
      requesterName: 'Sarah Chen',
      restaurantName: 'Din Tai Fung',
      amount: 24.50,
      status: 'pending',
      requestedAt: '2024-01-15T19:30:00Z',
      description: 'Dinner with friends',
      sessionId: 'dtf-20240115'
    },
    {
      id: '2',
      requesterName: 'Alex Kumar',
      restaurantName: 'McDonald\'s',
      amount: 12.80,
      status: 'selected',
      requestedAt: '2024-01-15T13:15:00Z',
      description: 'Lunch break',
      sessionId: 'mcd-20240115'
    },
    {
      id: '3',
      requesterName: 'Rachel Wong',
      restaurantName: 'Starbucks',
      amount: 8.40,
      status: 'paid',
      requestedAt: '2024-01-14T10:20:00Z',
      description: 'Morning coffee meetup',
      sessionId: 'sbx-20240114'
    },
    {
      id: '4',
      requesterName: 'David Tan',
      restaurantName: 'Pizza Hut',
      amount: 18.90,
      status: 'pending',
      requestedAt: '2024-01-13T20:45:00Z',
      description: 'Movie night dinner',
      sessionId: 'ph-20240113'
    }
  ]);

  const handleRequestAction = (requestId: string, action: 'select' | 'pay' | 'reject') => {
    setPaymentRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action === 'select' ? 'selected' : action === 'pay' ? 'paid' : 'rejected' }
          : request
      )
    );

    const actionMessages = {
      select: 'Items selected! Ready to pay.',
      pay: 'Payment completed! ✅',
      reject: 'Request declined.'
    };

    toast({
      title: actionMessages[action],
      description: action === 'pay' ? 'Your payment has been processed.' : undefined,
    });

    if (action === 'select') {
      const request = paymentRequests.find(r => r.id === requestId);
      if (request) {
        navigate(`/receipt-details/${request.sessionId}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-white';
      case 'selected': return 'bg-primary text-white';
      case 'pending': return 'bg-warning text-white';
      case 'rejected': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'selected': return <User size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = paymentRequests.filter(r => r.status === 'pending');
  const completedRequests = paymentRequests.filter(r => r.status !== 'pending');

  return (
    <MobileFrame>
      <Header 
        title="Bill Split Requests" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="flex-1 p-4 space-y-6 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} />
              <span className="text-sm text-blue-100">Pending</span>
            </div>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </Card>
          
          <Card className="p-4 bg-gradient-secondary text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} />
              <span className="text-sm text-green-100">Total Owed</span>
            </div>
            <div className="text-2xl font-bold">
              ${pendingRequests.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
            </div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-warning" size={20} />
              Pending Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-warning/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.restaurantName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Requested by {request.requesterName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ${request.amount.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(request.requestedAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {request.description}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleRequestAction(request.id, 'select')}
                        >
                          Select Items
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Requests */}
        {completedRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />
              Recent Activity ({completedRequests.length})
            </h3>
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <Card key={request.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{request.restaurantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.requesterName} • ${request.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(request.requestedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {paymentRequests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Requests</h3>
              <p className="text-muted-foreground text-center">
                When friends send you bill split requests, they'll appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-semibold text-primary mb-2">💡 How Bill Splitting Works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Friends send you payment requests from their receipts</li>
              <li>• Select your items from the shared receipt</li>
              <li>• Pay only for what you consumed</li>
              <li>• GST and service charges are split proportionally</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default BillSplit;