import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield } from "lucide-react";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (card: {
    cardType: string;
    cardName: string;
    last4: string;
    bank: string;
    cardCategory: string;
  }) => void;
}

const AddCardDialog: React.FC<AddCardDialogProps> = ({
  open,
  onOpenChange,
  onAddCard,
}) => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardCategory, setCardCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleAddCard = async () => {
    if (
      !cardNumber ||
      !expiryDate ||
      !cvv ||
      !cardholderName ||
      !bank ||
      !cardCategory
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details.",
        variant: "destructive",
        className: "bg-white text-black",
      });
      return;
    }

    setIsLoading(true);

    // Show approval popup
    setApprovalOpen(true);

    // After 2 seconds, close popup and simulate card add
    setTimeout(() => {
      setApprovalOpen(false);

      toast({
        title: "Card Added Successfully! 💳",
        description: "Your new card has been added and verified.",
      });

      onAddCard({
        cardType: cardType,
        cardName: cardholderName,
        last4: cardNumber.slice(-4),
        bank: bank,
        cardCategory: cardCategory,
      });

      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setBank("");
      setCardCategory("");
      setCardholderName("");
      setCardType("");
      setIsLoading(false);
      onOpenChange(false);
    }, 4000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Add New Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bank">Bank</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger style={{ backgroundColor: "white" }}>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white" }}>
                <SelectItem value="UOB">UOB</SelectItem>
                <SelectItem value="HSBC">HSBC</SelectItem>
                <SelectItem value="OCBC">OCBC</SelectItem>
                <SelectItem value="POSB">POSB</SelectItem>
                <SelectItem value="DBS">DBS</SelectItem>
                <SelectItem value="Standard Chartered">
                  Standard Chartered
                </SelectItem>
                <SelectItem value="Citibank">Citibank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cardCategory">Card Type</Label>
            <Select value={cardCategory} onValueChange={setCardCategory}>
              <SelectTrigger style={{ backgroundColor: "white" }}>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white" }}>
                <SelectItem value="Prepaid Card">Prepaid Card</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
                <SelectItem value="ATM Card">ATM Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cardCategory === "Credit Card" && (
            <div>
              <Label htmlFor="cardType">Card Brand</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger style={{ backgroundColor: "white" }}>
                  <SelectValue placeholder="Select card brand" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "white" }}>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="nets">NETS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="text-green-600" size={16} />
            <div className="text-sm">
              <p className="font-medium">Secure & Encrypted</p>
              <p className="text-muted-foreground text-xs">
                Your card details are protected with bank-level security
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddCard}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Card"}
            </Button>
          </div>
          {approvalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-xs text-center shadow-lg">
                <p className="text-lg font-semibold mb-2">
                  Please approve the linking process via your bank app to add
                  your card to NETSEverywhere.
                </p>
                <p className="text-muted-foreground text-sm">
                  (This will close automatically once you approve)
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;
