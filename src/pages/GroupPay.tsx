import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, DollarSign, Clock, Receipt, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface GroupPaySession {
  id: string;
  session_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  participants_count?: number;
  subtotal?: number | null;
  gst_amount?: number | null;
  service_charge?: number | null;
  receipt_items?: any[] | null;
}

const GroupPay = () => {
  const [sessions, setSessions] = useState<GroupPaySession[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('group_pay_sessions')
        .select(`
          *,
          group_pay_participants(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const sessionsWithCount = data?.map(session => ({
        id: session.id,
        session_name: session.session_name,
        total_amount: session.total_amount,
        status: session.status,
        created_at: session.created_at,
        subtotal: session.subtotal,
        gst_amount: session.gst_amount,
        service_charge: session.service_charge,
        receipt_items: session.receipt_items as any[] | null,
        participants_count: session.group_pay_participants?.[0]?.count || 0
      })) || [];
      
      setSessions(sessionsWithCount);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!sessionName || !totalAmount || !user) return;

    try {
      const amount = parseFloat(totalAmount);
      const subtotal = amount * 0.9; // Assuming 10% taxes/charges
      const gst_amount = subtotal * 0.07; // 7% GST
      const service_charge = subtotal * 0.1; // 10% service charge
      
      const { data, error } = await supabase
        .from('group_pay_sessions')
        .insert({
          creator_id: user.id,
          session_name: sessionName,
          total_amount: amount,
          subtotal: subtotal,
          gst_amount: gst_amount,
          service_charge: service_charge,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .select()
        .single();

      if (error) throw error;

      // Add sample receipt items for demo
      if (sessionName.toLowerCase().includes('din tai fung')) {
        await supabase.from('receipt_items').insert([
          { session_id: data.id, item_name: 'Xiaolongbao (8 pcs)', price: 8.50, quantity: 2 },
          { session_id: data.id, item_name: 'Beef Noodle Soup', price: 12.80 },
          { session_id: data.id, item_name: 'Fried Rice', price: 11.20 },
          { session_id: data.id, item_name: 'Jasmine Tea', price: 4.50, quantity: 2 }
        ]);
      }

      toast({
        title: "Session Created!",
        description: `${sessionName} has been created successfully.`
      });

      setSessionName('');
      setTotalAmount('');
      setShowCreateForm(false);
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create group pay session.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading group sessions...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header 
        title="GroupPay" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Session
        </Button>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Group Pay Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionName">Session Name</Label>
                <Input
                  id="sessionName"
                  placeholder="e.g., Dinner at Restaurant"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Amount (SGD)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createSession} className="flex-1">
                  Create Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Group Sessions</h3>
              <p className="text-muted-foreground text-center">
                Create your first group pay session to split bills with friends.
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{session.session_name}</CardTitle>
                  <Badge variant={getStatusColor(session.status) as any}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        ${session.total_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {session.participants_count} participants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Created {new Date(session.created_at).toLocaleDateString()}
                  </div>
                  <div className="space-y-2">
                    {(session.subtotal || session.gst_amount) && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${(session.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (7%):</span>
                          <span>${(session.gst_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service (10%):</span>
                          <span>${(session.service_charge || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/receipt-details?session=${session.id}`)}
                      >
                        <Receipt size={14} className="mr-1" />
                        View Receipt
                      </Button>
                      <Button variant="default" size="sm" className="flex-1">
                        <Share size={14} className="mr-1" />
                        Share Link
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

export default GroupPay;