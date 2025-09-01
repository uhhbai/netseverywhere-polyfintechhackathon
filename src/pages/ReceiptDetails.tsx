import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Users, DollarSign, Share, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
}

const ReceiptDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const merchantName = searchParams.get('merchant') || 'Din Tai Fung';
  const fromPage = searchParams.get('from') || 'receipts';
  
  // Dynamic receipt data based on merchant
  const getReceiptItems = (merchant: string): ReceiptItem[] => {
    const merchantItems: Record<string, ReceiptItem[]> = {
      'Din Tai Fung': [
        { id: '1', name: 'Xiaolongbao (8 pcs)', price: 8.50, quantity: 2, selected: false },
        { id: '2', name: 'Beef Noodle Soup', price: 12.80, quantity: 1, selected: false },
        { id: '3', name: 'Fried Rice', price: 11.20, quantity: 1, selected: false },
        { id: '4', name: 'Jasmine Tea', price: 4.50, quantity: 2, selected: false },
        { id: '5', name: 'Sweet & Sour Pork', price: 15.60, quantity: 1, selected: false },
        { id: '6', name: 'Hot & Sour Soup', price: 6.80, quantity: 1, selected: false }
      ],
      'McDonald\'s': [
        { id: '1', name: 'Big Mac Meal', price: 9.50, quantity: 2, selected: false },
        { id: '2', name: 'Chicken McNuggets (9pcs)', price: 7.90, quantity: 1, selected: false },
        { id: '3', name: 'Apple Pie', price: 2.50, quantity: 3, selected: false },
        { id: '4', name: 'Coca Cola', price: 2.20, quantity: 2, selected: false }
      ],
      'Starbucks': [
        { id: '1', name: 'Caffe Latte (Grande)', price: 6.50, quantity: 2, selected: false },
        { id: '2', name: 'Cappuccino (Tall)', price: 5.20, quantity: 1, selected: false },
        { id: '3', name: 'Blueberry Muffin', price: 4.80, quantity: 2, selected: false }
      ]
    };
    
    return merchantItems[merchant] || merchantItems['Din Tai Fung'];
  };

  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>(() => getReceiptItems(merchantName));

  const subtotal = 68.40;
  const gst = subtotal * 0.07;
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + gst + serviceCharge;

  const selectedTotal = receiptItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const myShare = selectedTotal > 0 ? 
    selectedTotal + (selectedTotal / subtotal) * (gst + serviceCharge) : 0;

  const toggleItem = (itemId: string) => {
    setReceiptItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const confirmSelection = () => {
    if (selectedTotal === 0) {
      toast({
        title: "No items selected",
        description: "Please select the items you consumed.",
        variant: "destructive"
      });
      return;
    }

    // Update the session status in SharedOrders component
    if (typeof window !== 'undefined') {
      localStorage.setItem(`session-${sessionId}`, JSON.stringify({
        status: 'paid',
        amount: myShare,
        timestamp: new Date().toISOString()
      }));
    }

    toast({
      title: "Selection Confirmed! ✓",
      description: `Your share: $${myShare.toFixed(2)}. Payment successful!`,
    });
    
    setTimeout(() => navigate(fromPage === 'shared-orders' ? '/shared-orders' : '/receipts'), 1500);
  };

  return (
    <MobileFrame>
        <Header 
          title={`${merchantName} Receipt`} 
          showBack 
          onBack={() => navigate(fromPage === 'shared-orders' ? '/shared-orders' : '/receipts')}
        />
      
      <div className="p-4 space-y-4 pb-24">
        {/* Restaurant Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{merchantName}</CardTitle>
              <Badge variant="outline">
                <Users size={14} className="mr-1" />
                4 friends invited
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Marina Bay Sands</p>
              <p>Today, 7:30 PM</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📝 Select Your Items</h3>
            <p className="text-sm text-blue-700">
              Tap the items you consumed. GST and service charge will be split proportionally.
            </p>
          </CardContent>
        </Card>

        {/* Receipt Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {receiptItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (7%)</span>
              <span>${gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge (10%)</span>
              <span>${serviceCharge.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Bill</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* My Share */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Your Share</h3>
                <p className="text-sm text-muted-foreground">
                  Based on selected items
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${myShare.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedTotal > 0 ? 'Including taxes' : 'Select items first'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={confirmSelection}
            className="w-full"
            disabled={selectedTotal === 0}
          >
            <Check size={16} className="mr-2" />
            Confirm My Selection (${myShare.toFixed(2)})
          </Button>
          
          <Button variant="outline" className="w-full">
            <Share size={16} className="mr-2" />
            Share Receipt Link
          </Button>
        </div>

        {/* Payment Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">You</span>
                <Badge variant={selectedTotal > 0 ? "default" : "outline"}>
                  {selectedTotal > 0 ? "Selected" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sarah Chen</span>
                <Badge variant="secondary">Paid $18.50</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alex Kumar</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rachel Wong</span>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default ReceiptDetails;