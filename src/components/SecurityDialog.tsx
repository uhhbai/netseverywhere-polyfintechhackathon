import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Smartphone, Download, Eye, EyeOff } from 'lucide-react';

interface SecurityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'password' | 'twofa' | 'privacy' | 'data';
}

const SecurityDialog: React.FC<SecurityDialogProps> = ({ open, onOpenChange, type }) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareData: false,
    marketing: true,
    analytics: false,
    location: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
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
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Password Updated! 🔐",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      onOpenChange(false);
    }, 1500);
  };

  const handleTwoFAToggle = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setTwoFAEnabled(!twoFAEnabled);
      toast({
        title: twoFAEnabled ? "2FA Disabled" : "2FA Enabled! 📱",
        description: twoFAEnabled 
          ? "Two-factor authentication has been disabled." 
          : "Two-factor authentication is now active.",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handlePrivacyUpdate = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Privacy Settings Updated! 🔒",
        description: "Your privacy preferences have been saved.",
      });
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleDataDownload = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Data Export Initiated! 📁",
        description: "Your data export will be sent to your email within 24 hours.",
      });
      setIsLoading(false);
      onOpenChange(false);
    }, 2000);
  };

  const getDialogContent = () => {
    switch (type) {
      case 'password':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Mix of uppercase and lowercase letters</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>

            <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        );

      case 'twofa':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Smartphone className="text-primary" size={24} />
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">
                  Require verification code from your phone
                </p>
              </div>
              <Switch
                checked={twoFAEnabled}
                onCheckedChange={handleTwoFAToggle}
                disabled={isLoading}
              />
            </div>

            {twoFAEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Two-factor authentication is enabled. You'll receive SMS codes when signing in.
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Enter your password as usual</li>
                <li>Receive a 6-digit code via SMS</li>
                <li>Enter the code to complete sign-in</li>
              </ul>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Sharing</p>
                  <p className="text-sm text-muted-foreground">Share data with partners for better services</p>
                </div>
                <Switch
                  checked={privacySettings.shareData}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareData: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                </div>
                <Switch
                  checked={privacySettings.marketing}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, marketing: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">Help improve our services with usage data</p>
                </div>
                <Switch
                  checked={privacySettings.analytics}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, analytics: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Location Services</p>
                  <p className="text-sm text-muted-foreground">Use location for nearby merchants</p>
                </div>
                <Switch
                  checked={privacySettings.location}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, location: checked }))}
                />
              </div>
            </div>

            <Button onClick={handlePrivacyUpdate} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Download className="text-primary" size={24} />
              <div>
                <h4 className="font-medium">Download Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Get a copy of all your personal data
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm">Your data export will include:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Profile information and settings</li>
                <li>• Transaction history and receipts</li>
                <li>• Payment methods and preferences</li>
                <li>• Referral and reward data</li>
                <li>• Support conversation history</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 Your data will be emailed to you as a ZIP file within 24 hours.
              </p>
            </div>

            <Button onClick={handleDataDownload} disabled={isLoading} className="w-full">
              {isLoading ? 'Preparing Export...' : 'Request Data Export'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'password': return 'Change Password';
      case 'twofa': return 'Two-Factor Authentication';
      case 'privacy': return 'Privacy Settings';
      case 'data': return 'Download Data';
      default: return 'Security';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SecurityDialog;