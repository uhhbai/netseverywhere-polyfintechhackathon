import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import FeatureGrid from '@/components/FeatureGrid';
import BottomNavigation from '@/components/BottomNavigation';
import netsLogo from '@/assets/nets-logo.png';

const Index = () => {
  return (
    <MobileFrame>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
          </svg>
          <span className="text-base font-medium text-muted-foreground">Back</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">NETS for All</h1>
        <div className="w-6"></div>
      </div>

      {/* NETS Everywhere Branding */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-xl font-bold text-foreground">Everywhere</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-hover transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></div>
          </button>
          <button className="p-2 rounded-full hover:bg-hover transition-colors">
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
      <div className="flex-1 pb-20 bg-background">
        <BalanceCard />
        
        {/* Feature Cards */}
        <div className="px-6 mt-8">
          <div className="grid grid-cols-2 gap-4">
            {/* GroupPay */}
            <div className="bg-surface rounded-3xl p-6 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">NETS</h3>
                <h3 className="font-bold text-primary text-lg mb-2">GroupPay</h3>
                <p className="text-xs text-muted-foreground">Split bills easily</p>
              </div>
            </div>

            {/* Promos */}
            <div className="bg-surface rounded-3xl p-6 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="8" width="18" height="4" fill="white" rx="1"/>
                    <path d="M12 8v13l3-3 3 3V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">NETS</h3>
                <h3 className="font-bold text-accent text-lg mb-2">Promos</h3>
                <p className="text-xs text-muted-foreground">Exclusive deals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </MobileFrame>
  );
};

export default Index;
