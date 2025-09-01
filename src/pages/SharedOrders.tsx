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
import { Users, Receipt, Clock, CheckCircle } from 'lucide-react';

interface SharedSession {
  id: string;
  session_name: string;
  creator_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  my_status: string;
  my_amount: number;
}

const SharedOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sharedSessions, setSharedSessions] = useState<SharedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSharedSessions();
    }
  }, [user]);

  useEffect(() => {
    // Listen for status updates from ReceiptDetails page
    const handleStorageChange = () => {
      setSharedSessions(prev => prev.map(session => {
        const statusData = localStorage.getItem(`session-${session.id}`);
        if (statusData) {
          const { status, amount } = JSON.parse(statusData);
          return { ...session, my_status: status, my_amount: amount };
        }
        return session;
      }));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchSharedSessions = async () => {
    try {
      // First seed demo data
      await supabase.rpc('seed_demo_users');

      // Create some demo shared sessions for the current user
      const demoSessions = [
        {
          id: 'demo-1',
          session_name: 'Din Tai Fung Dinner',
          creator_name: 'Sarah Chen',
          total_amount: 85.60,
          status: 'active',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          my_status: 'pending',
          my_amount: 0
        },
        {
          id: 'demo-2',
          session_name: 'McDonald\'s Lunch',
          creator_name: 'Alex Kumar',
          total_amount: 42.30,
          status: 'active',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          my_status: 'selected',
          my_amount: 12.50
        },
        {
          id: 'demo-3',
          session_name: 'Starbucks Coffee Run',
          creator_name: 'Emily Tan',
          total_amount: 28.40,
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          my_status: 'paid',
          my_amount: 8.90
        }
      ];

      setSharedSessions(demoSessions);
    } catch (error) {
      console.error('Error fetching shared sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'selected':
        return 'outline';
      case 'paid':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'selected':
        return <Receipt size={16} />;
      case 'paid':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleViewReceipt = (sessionId: string, sessionName: string) => {
    const merchantName = sessionName.split(' ')[0] + ' ' + sessionName.split(' ')[1];
    navigate(`/receipt-details?session=${sessionId}&merchant=${encodeURIComponent(merchantName)}&from=shared-orders`);
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading shared orders...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Shared Orders" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="text-primary" size={24} />
              <div>
                <p className="text-2xl font-bold">{sharedSessions.length}</p>
                <p className="text-sm text-muted-foreground">Orders Shared</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Receipt className="text-primary" size={24} />
              <div>
                <p className="text-2xl font-bold">
                  ${sharedSessions.filter(s => s.my_status === 'paid').reduce((sum, s) => sum + s.my_amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Shared Sessions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Receipts Shared With You</h3>
          
          {sharedSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">No Shared Orders</h3>
              <p className="text-muted-foreground">
                When friends share their receipts with you, they'll appear here.
              </p>
            </Card>
          ) : (
            sharedSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Receipt className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{session.session_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Shared by {session.creator_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(session.my_status)}
                    <Badge variant={getStatusColor(session.my_status)}>
                      {session.my_status === 'pending' && 'Select Items'}
                      {session.my_status === 'selected' && `$${session.my_amount.toFixed(2)}`}
                      {session.my_status === 'paid' && 'Paid'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total: ${session.total_amount.toFixed(2)} • {new Date(session.created_at).toLocaleDateString()}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewReceipt(session.id, session.session_name)}
                  >
                    {session.my_status === 'pending' ? 'Select Items' : 'View Receipt'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">💡 How Group Sharing Works</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Friends share their receipts with you via link</li>
            <li>• Tap "Select Items" to choose what you ordered</li>
            <li>• GST and service charges are split fairly</li>
            <li>• Pay your share directly through the app</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default SharedOrders;