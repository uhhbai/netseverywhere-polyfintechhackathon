import { useState, useEffect } from 'react';
import { User, CreditCard, Bell, Shield, LogOut, Edit, Award, Settings, Share2, Gift, Users, Receipt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SupportDialog from '@/components/SupportDialog';
import PolicyDialog from '@/components/PolicyDialog';
import AddCardDialog from '@/components/AddCardDialog';
import SecurityDialog from '@/components/SecurityDialog';

interface UserProfile {
  display_name: string;
  phone_number?: string;
  balance: number;
  total_spent: number;
  streak_count: number;
  avatar_url?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoPayment, setAutoPayment] = useState(true);

  // Dialog states
  const [supportOpen, setSupportOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'terms' | 'privacy'>('terms');
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityType, setSecurityType] = useState<'password' | 'twofa' | 'privacy' | 'data'>('password');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setPhoneNumber(data.phone_number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          phone_number: phoneNumber
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      });

      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Profile" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                  />
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold">{profile?.display_name || 'User'}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {profile?.phone_number && (
                    <p className="text-sm text-muted-foreground">{profile.phone_number}</p>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (editing) {
                  updateProfile();
                } else {
                  setEditing(true);
                }
              }}
            >
              {editing ? 'Save' : <Edit size={16} />}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">${profile?.balance?.toFixed(2) || '0.00'}</div>
              <div className="text-xs text-muted-foreground">Balance</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-success">{profile?.streak_count || 0}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">${profile?.total_spent?.toFixed(0) || '0'}</div>
              <div className="text-xs text-muted-foreground">Total Spent</div>
            </div>
          </div>
        </Card>

        {/* Account & Cards */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Cards & Banking</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">DBS</span>
                </div>
                <div>
                  <p className="font-medium">DBS Savings Account</p>
                  <p className="text-sm text-muted-foreground">****1234</p>
                </div>
              </div>
              <Badge variant="secondary">Primary</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">UOB</span>
                </div>
                <div>
                  <p className="font-medium">UOB Credit Card</p>
                  <p className="text-sm text-muted-foreground">****5678</p>
                </div>
              </div>
              <Badge variant="outline">Linked</Badge>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => setAddCardOpen(true)}
            >
              Add New Card
            </Button>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get updates on payments and activities</p>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Biometric Authentication</p>
                <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
              </div>
              <Switch 
                checked={biometric}
                onCheckedChange={setBiometric}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Payment</p>
                <p className="text-sm text-muted-foreground">Enable contactless payments</p>
              </div>
              <Switch 
                checked={autoPayment}
                onCheckedChange={setAutoPayment}
              />
            </div>
          </div>
        </Card>

        {/* Rewards & Achievements */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Rewards & Achievements</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium">VIP Member</p>
                  <p className="text-sm text-muted-foreground">Unlocked at $1000 spending</p>
                </div>
              </div>
              <Badge className="bg-gradient-gold text-white">Achieved</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl grayscale">🔥</span>
                <div>
                  <p className="font-medium">Streak Master</p>
                  <p className="text-sm text-muted-foreground">Maintain 30-day streak</p>
                </div>
              </div>
              <Badge variant="outline">18/30 days</Badge>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/badges')}
            >
              View All Badges
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Security & Privacy</h3>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setSecurityType('password');
                setSecurityOpen(true);
              }}
            >
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setSecurityType('twofa');
                setSecurityOpen(true);
              }}
            >
              Two-Factor Authentication
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setSecurityType('privacy');
                setSecurityOpen(true);
              }}
            >
              Privacy Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setSecurityType('data');
                setSecurityOpen(true);
              }}
            >
              Download My Data
            </Button>
          </div>
        </Card>

        {/* More Features */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">More Features</h3>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/referrals')}
            >
              <Share2 size={16} className="mr-2" />
              Referral Program - Earn $10
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/shared-orders')}
            >
              <Users size={16} className="mr-2" />
              Group Pay Sessions
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/bill-split')}
            >
              <Receipt size={16} className="mr-2" />
              Bill Split Requests
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/receipts')}
            >
              <Receipt size={16} className="mr-2" />
              My Receipts
            </Button>
          </div>
        </Card>

        {/* Support & Info */}
        <Card className="p-6">
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSupportOpen(true)}
            >
              Help & Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setPolicyType('terms');
                setPolicyOpen(true);
              }}
            >
              Terms of Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setPolicyType('privacy');
                setPolicyOpen(true);
              }}
            >
              Privacy Policy
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              NETS Everywhere v1.0.0
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          <span className="ml-2">Sign Out</span>
        </Button>
      </div>

      <BottomNavigation />

      {/* Dialogs */}
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      <PolicyDialog 
        open={policyOpen} 
        onOpenChange={setPolicyOpen}
        type={policyType}
      />
      <AddCardDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
      <SecurityDialog 
        open={securityOpen} 
        onOpenChange={setSecurityOpen}
        type={securityType}
      />
    </MobileFrame>
  );
};

export default Profile;