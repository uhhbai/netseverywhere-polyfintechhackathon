import { useState, useEffect } from "react";
import { Camera, QrCode, CreditCard, MapPin, History, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MobileFrame from "@/components/MobileFrame";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RecentScan {
  id: string;
  merchant_name: string;
  amount: number;
  created_at: string;
  location: string;
}

const Scanning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRecentScans();
    }
  }, [user]);

  const fetchRecentScans = async () => {
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (transactions) {
        const scans = transactions.map((t) => ({
          id: t.id,
          merchant_name: t.merchant_name,
          amount: Number(t.amount),
          created_at: t.created_at,
          location: "Singapore", // Simulated location
        }));
        setRecentScans(scans);
      }
    } catch (error) {
      console.error("Error fetching recent scans:", error);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      // Keep camera active for 2 seconds then stop
      setTimeout(() => {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setIsScanning(false);

        toast({
          title: "QR Code Scanned! 📱",
          description: `Paid $17 to Jakey H!`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const openNETSClick = () => {
    toast({
      title: "NETS Contactless",
      description: "Opening contactless payment mode...",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading scanner...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="NETS QR Scanner" />

      <div className="p-6 space-y-6 pb-24">
        {/* Scanner Interface */}
        <Card className="p-8 text-center">
          {!isScanning ? (
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center">
                <QrCode size={64} className="text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">Scan to Pay</h2>
                <p className="text-muted-foreground">
                  Point your camera at the NETS QR code to make a payment
                </p>
              </div>

              {/* Discount Code Field */}
              <div className="text-left">
                <label className="block text-sm font-medium mb-2">Discount Code (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    className="w-full px-3 py-2 border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Apply discount codes before scanning
                </p>
              </div>

              <Button
                onClick={startScanning}
                className="w-full h-14 text-lg bg-gradient-primary"
              >
                <Camera className="mr-3" size={24} />
                Start Scanning
              </Button>
            </div>
          ) : stream ? (
            <video
              autoPlay
              playsInline
              muted
              ref={(videoElement) => {
                if (videoElement && stream) {
                  videoElement.srcObject = stream;
                }
              }}
              className="w-32 h-32 mx-auto rounded-3xl"
            />
          ) : (
            // Fallback scanning animation UI if stream is not ready
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-3xl flex items-center justify-center animate-pulse">
              <Camera size={64} className="text-gray-400" />
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <Button
              onClick={openNETSClick}
              variant="ghost"
              className="w-full h-20 flex-col gap-2"
            >
              <Zap className="text-primary" size={32} />
              <span className="text-sm font-medium">NETS Contactless</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Contactless payments via NFC
            </p>
          </Card>

          <Card className="p-4 text-center">
            <Button
              variant="ghost"
              className="w-full h-20 flex-col gap-2"
              onClick={() => navigate("../myqr")}
            >
              <CreditCard className="text-secondary" size={32} />
              <span className="text-sm font-medium">My QR</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Generate a QR code for your account
            </p>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Recent Scans</h3>
          </div>

          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <QrCode className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{scan.merchant_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={12} />
                        <span>{scan.location}</span>
                        <span>•</span>
                        <span>{formatDate(scan.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${scan.amount.toFixed(2)}</p>
                    <Badge className="bg-success text-white">Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
              />
              <p className="text-muted-foreground">No recent scans</p>
              <p className="text-sm text-muted-foreground">
                Start scanning QR codes to see your history
              </p>
            </div>
          )}
        </Card>

        {/* Scanner Tips */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">📱 Scanning Tips</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Hold your phone steady and ensure good lighting</li>
            <li>• Position the QR code within the scanning frame</li>
            <li>• Keep a distance of 6-12 inches from the code</li>
            <li>• Clean your camera lens for better scanning</li>
            <li>• Works with all NETS QR codes in Singapore</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Scanning;
