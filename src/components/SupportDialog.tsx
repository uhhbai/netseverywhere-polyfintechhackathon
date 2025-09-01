import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, FileText, ExternalLink } from 'lucide-react';

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SupportDialog: React.FC<SupportDialogProps> = ({ open, onOpenChange }) => {
  const handleLiveChat = () => {
    // Simulate opening live chat
    window.open('https://help.nets.com.sg/chat', '_blank');
  };

  const handlePhoneSupport = () => {
    window.open('tel:+6562245577');
  };

  const handleEmailSupport = () => {
    window.open('mailto:support@nets.com.sg?subject=NETS Everywhere Support Request');
  };

  const handleFAQ = () => {
    window.open('https://help.nets.com.sg/faq', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Contact Support</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLiveChat}
              >
                <MessageCircle className="mr-2" size={16} />
                Live Chat (24/7)
                <ExternalLink className="ml-auto" size={14} />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePhoneSupport}
              >
                <Phone className="mr-2" size={16} />
                Call: +65 6224 5577
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEmailSupport}
              >
                <Mail className="mr-2" size={16} />
                Email Support
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Self-Help Resources</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleFAQ}
              >
                <FileText className="mr-2" size={16} />
                FAQ & Troubleshooting
                <ExternalLink className="ml-auto" size={14} />
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-muted">
            <h4 className="font-semibold mb-2">Quick Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Payment issues? Check your network connection</li>
              <li>• Can't scan QR? Ensure camera permissions are enabled</li>
              <li>• Balance not updating? Pull down to refresh</li>
              <li>• For urgent payment issues, use live chat</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;