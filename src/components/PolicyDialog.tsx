import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'terms' | 'privacy';
}

const PolicyDialog: React.FC<PolicyDialogProps> = ({ open, onOpenChange, type }) => {
  const isTerms = type === 'terms';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isTerms ? 'Terms of Service' : 'Privacy Policy'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            {isTerms ? (
              // Terms of Service Content
              <>
                <div>
                  <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using NETS Everywhere, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Service Description</h3>
                  <p className="text-muted-foreground">
                    NETS Everywhere is a digital payment platform that enables users to make secure transactions using QR codes, contactless payments, and bill splitting features.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. User Responsibilities</h3>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Maintain the security of your account credentials</li>
                    <li>• Provide accurate and up-to-date information</li>
                    <li>• Use the service only for lawful purposes</li>
                    <li>• Report unauthorized use immediately</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Payment Terms</h3>
                  <p className="text-muted-foreground">
                    All transactions are processed securely through NETS. Transaction fees may apply as disclosed during the payment process.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">5. Privacy and Data</h3>
                  <p className="text-muted-foreground">
                    Your privacy is important to us. Please refer to our Privacy Policy for details on how we collect, use, and protect your information.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">6. Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    NETS shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of this service.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">7. Modifications</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. Users will be notified of significant changes.
                  </p>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                  Last updated: January 2024<br />
                  NETS Pte Ltd, Singapore
                </div>
              </>
            ) : (
              // Privacy Policy Content
              <>
                <div>
                  <h3 className="font-semibold mb-2">Information We Collect</h3>
                  <p className="text-muted-foreground mb-2">
                    We collect information you provide directly to us, such as:
                  </p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Account registration information (name, email, phone)</li>
                    <li>• Payment information and transaction history</li>
                    <li>• Device information and usage data</li>
                    <li>• Location data (with your permission)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How We Use Your Information</h3>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• To provide and maintain our services</li>
                    <li>• To process payments and transactions</li>
                    <li>• To send you important updates and notifications</li>
                    <li>• To improve our services and user experience</li>
                    <li>• To comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Information Sharing</h3>
                  <p className="text-muted-foreground">
                    We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
                  </p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• With payment processors to complete transactions</li>
                    <li>• With service providers who assist our operations</li>
                    <li>• When required by law or legal process</li>
                    <li>• To protect our rights and prevent fraud</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Your Rights</h3>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Access and update your personal information</li>
                    <li>• Request deletion of your data</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Data portability (where applicable)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy, please contact us at privacy@nets.com.sg
                  </p>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                  Last updated: January 2024<br />
                  NETS Pte Ltd, Singapore
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;