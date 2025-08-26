import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SupportDialog = ({ open, onOpenChange }: SupportDialogProps) => {
  const { toast } = useToast();

  const handleSubmitTicket = () => {
    toast({
      title: "Support Ticket Submitted",
      description: "We'll get back to you within 24 hours.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Get help with your NETS Everywhere account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex-col h-16 gap-1">
              <Phone size={20} />
              <span className="text-xs">Call Support</span>
            </Button>
            <Button variant="outline" className="flex-col h-16 gap-1">
              <MessageCircle size={20} />
              <span className="text-xs">Live Chat</span>
            </Button>
          </div>

          {/* Submit Ticket */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Submit a Ticket</h4>
            <div className="space-y-3">
              <Input placeholder="Subject" />
              <Textarea placeholder="Describe your issue..." rows={3} />
              <Button onClick={handleSubmitTicket} className="w-full">
                Submit Ticket
              </Button>
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Common Questions</h4>
            <div className="space-y-2 text-sm">
              <p>• How do I add a new card?</p>
              <p>• Why is my payment failing?</p>
              <p>• How do I reset my password?</p>
              <p>• How does bill splitting work?</p>
            </div>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>📞 Hotline: 1800-NETS-123</p>
            <p>📧 Email: support@nets.com.sg</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;