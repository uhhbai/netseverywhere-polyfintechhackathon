import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Receipts from "./pages/Receipts";

import Promos from "./pages/Promos";
import Streak from "./pages/Streak";
import Leaderboard from "./pages/Leaderboard";
import Cashback from "./pages/Cashback";
import Badges from "./pages/Badges";
import Analytics from "./pages/Analytics";
import Challenges from "./pages/Challenges";
import Gifting from "./pages/Gifting";
import Referrals from "./pages/Referrals";
import Scanning from "./pages/Scanning";
import NETSClick from "./pages/NETSClick";
import Profile from "./pages/Profile";
import ReceiptDetails from "./pages/ReceiptDetails";
import SharedOrders from "./pages/SharedOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/receipts" element={<Receipts />} />
            
            <Route path="/promos" element={<Promos />} />
            <Route path="/streak" element={<Streak />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/cashback" element={<Cashback />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/gifting" element={<Gifting />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/scanning" element={<Scanning />} />
            <Route path="/netsclick" element={<NETSClick />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/receipt-details/:sessionId" element={<ReceiptDetails />} />
            <Route path="/shared-orders" element={<SharedOrders />} />
            <Route path="/grouppay" element={<SharedOrders />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
