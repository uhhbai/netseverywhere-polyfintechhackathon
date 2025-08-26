import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Shield, FileText } from 'lucide-react';

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'terms' | 'privacy';
}

const PolicyDialog = ({ open, onOpenChange, type }: PolicyDialogProps) => {
  const isTerms = type === 'terms';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTerms ? <FileText className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            {isTerms ? 'Terms of Service' : 'Privacy Policy'}
          </DialogTitle>
          <DialogDescription>
            {isTerms ? 'NETS Everywhere Terms and Conditions' : 'How we protect your privacy'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 text-sm">
            {isTerms ? (
              <>
                <div>
                  <h4 className="font-semibold mb-2">1. Acceptance of Terms</h4>
                  <p className="text-muted-foreground">
                    By using NETS Everywhere, you agree to be bound by these terms and conditions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Service Description</h4>
                  <p className="text-muted-foreground">
                    NETS Everywhere provides digital payment services including bill splitting, 
                    QR payments, and rewards management.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. User Responsibilities</h4>
                  <p className="text-muted-foreground">
                    Users must maintain the security of their accounts and report unauthorized 
                    transactions immediately.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4. Payment Processing</h4>
                  <p className="text-muted-foreground">
                    All payments are processed securely through NETS infrastructure with 
                    industry-standard encryption.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5. Refunds and Disputes</h4>
                  <p className="text-muted-foreground">
                    Refund requests must be submitted within 30 days. Disputes are resolved 
                    according to NETS policies.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-semibold mb-2">Information We Collect</h4>
                  <p className="text-muted-foreground">
                    We collect information you provide directly, usage data, and device information 
                    to improve our services.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How We Use Your Data</h4>
                  <p className="text-muted-foreground">
                    Your data is used to process payments, prevent fraud, improve services, 
                    and comply with legal requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Security</h4>
                  <p className="text-muted-foreground">
                    We use bank-grade encryption and security measures to protect your personal 
                    and financial information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Third-Party Sharing</h4>
                  <p className="text-muted-foreground">
                    We only share data with authorized partners and service providers under 
                    strict confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your Rights</h4>
                  <p className="text-muted-foreground">
                    You have the right to access, update, or delete your personal information 
                    at any time through your account settings.
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;