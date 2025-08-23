import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import FeatureGrid from '@/components/FeatureGrid';
import BottomNavigation from '@/components/BottomNavigation';
import netsLogo from '@/assets/nets-logo.png';

const Index = () => {
  return (
    <MobileFrame>
      {/* Header with NETS branding */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-card-border">
        <div className="flex items-center gap-3">
          <button className="p-2 -ml-2 rounded-xl hover:bg-hover transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
            </svg>
          </button>
          <span className="text-sm font-medium text-muted-foreground">Back</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">NETS for All</h1>
        <div className="w-6"></div>
      </div>

      {/* NETS Everywhere Branding */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface">
        <div className="flex items-center gap-3">
          <img src={netsLogo} alt="NETS" className="h-8" />
          <span className="text-xl font-bold text-foreground">Everywhere</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-hover transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface"></div>
          </button>
          <button className="p-2 rounded-xl hover:bg-hover transition-colors">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-20">
        <BalanceCard />
        <FeatureGrid />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </MobileFrame>
  );
};

export default Index;
