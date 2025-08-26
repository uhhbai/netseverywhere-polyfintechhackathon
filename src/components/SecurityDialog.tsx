import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Shield, Key, Smartphone, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'password' | 'twofa' | 'privacy' | 'data';
}

const SecurityDialog = ({ open, onOpenChange, type }: SecurityDialogProps) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Updated! 🔒",
      description: "Your password has been changed successfully.",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  const handleEnable2FA = () => {
    toast({
      title: "2FA Enabled! 📱",
      description: "Two-factor authentication is now active.",
    });
    onOpenChange(false);
  };

  const handleDataDownload = () => {
    toast({
      title: "Data Export Started 📊",
      description: "We'll email you when your data is ready for download.",
    });
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'password': return 'Change Password';
      case 'twofa': return 'Two-Factor Authentication';
      case 'privacy': return 'Privacy Settings';
      case 'data': return 'Download My Data';
      default: return 'Security';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Manage your account security settings
          </DialogDescription>
        </DialogHeader>

        {type === 'password' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} className="w-full">
              Update Password
            </Button>
          </div>
        )}

        {type === 'twofa' && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Authenticator App</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Add an extra layer of security with 2FA using Google Authenticator or similar apps.
              </p>
              <Button onClick={handleEnable2FA} className="w-full">
                Enable 2FA
              </Button>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Key className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Backup Codes</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate backup codes for account recovery.
              </p>
              <Button variant="outline" className="w-full">
                Generate Codes
              </Button>
            </Card>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Privacy Controls</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Profile visibility</span>
                  <Button variant="outline" size="sm">Friends only</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transaction history</span>
                  <Button variant="outline" size="sm">Private</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Activity status</span>
                  <Button variant="outline" size="sm">Hidden</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {type === 'data' && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Download className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Export Your Data</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Download a copy of all your account data including transactions, 
                profile information, and settings.
              </p>
              <ul className="text-xs text-muted-foreground mb-3 space-y-1">
                <li>• Account information and preferences</li>
                <li>• Transaction history and receipts</li>
                <li>• Referral and reward data</li>
                <li>• Chat and support conversations</li>
              </ul>
              <Button onClick={handleDataDownload} className="w-full">
                Request Data Export
              </Button>
            </Card>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityDialog;