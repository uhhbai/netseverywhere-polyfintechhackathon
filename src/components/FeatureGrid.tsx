import { Users, Gift, Target, BarChart3, Bookmark, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureGrid = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: 'NETS GroupPay',
      subtitle: 'Split bills easily',
      color: 'bg-primary',
      size: 'large'
    },
    {
      icon: Gift,
      title: 'NETS Promos',
      subtitle: 'Exclusive deals',
      color: 'bg-accent',
      size: 'small'
    },
    {
      icon: Target,
      title: 'NETS Challenges',
      subtitle: 'Daily rewards',
      color: 'bg-streak',
      size: 'full'
    },
    {
      icon: Gift,
      title: 'NETS Gift',
      subtitle: 'Send money',
      color: 'bg-secondary',
      size: 'small'
    },
    {
      icon: BarChart3,
      title: 'NETS Analytics',
      subtitle: 'Track spending',
      color: 'bg-primary-dark',
      size: 'small'
    },
    {
      icon: Bookmark,
      title: 'Referrals',
      subtitle: 'Earn rewards',
      color: 'bg-gold',
      size: 'small'
    }
  ];

  return (
    <div className="px-6 mt-6">
      <div className="grid grid-cols-2 gap-4">
        {/* GroupPay - Large card */}
        <div 
          className="col-span-1 bg-surface rounded-3xl p-6 card-hover card-press border border-card-border cursor-pointer"
          onClick={() => navigate('/bill-split-requests')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">NETS</h3>
            <h3 className="font-bold text-primary text-base mb-1">GroupPay</h3>
            <p className="text-xs text-muted-foreground">Split bills easily</p>
          </div>
        </div>

        {/* Promos */}
        <div 
          className="col-span-1 bg-surface rounded-3xl p-6 card-hover card-press border border-card-border cursor-pointer"
          onClick={() => navigate('/promos')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-4">
              <Gift size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">NETS</h3>
            <h3 className="font-bold text-accent text-base mb-1">Promos</h3>
            <p className="text-xs text-muted-foreground">Exclusive deals</p>
          </div>
        </div>

        {/* Challenges - Full width */}
        <div 
          className="col-span-2 bg-surface rounded-3xl p-6 card-hover card-press border border-card-border cursor-pointer"
          onClick={() => navigate('/challenges')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-streak rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-streak text-lg mb-1">NETS Challenges</h3>
              <p className="text-sm text-muted-foreground">Daily rewards & streaks</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-streak/10 text-streak text-xs px-2 py-1 rounded-lg font-medium">
                  🔥 7 day streak
                </div>
                <div className="bg-gold/10 text-gold text-xs px-2 py-1 rounded-lg font-medium">
                  +50 pts today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row - 3 small cards */}
        <div className="col-span-2 grid grid-cols-3 gap-3">
          <div 
            className="bg-surface rounded-2xl p-4 card-hover card-press border border-card-border cursor-pointer"
            onClick={() => navigate('/gifting')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3">
                <Gift size={18} className="text-white" />
              </div>
              <h4 className="font-medium text-secondary text-sm mb-1">NETS</h4>
              <h4 className="font-semibold text-xs">Gift</h4>
            </div>
          </div>

          <div 
            className="bg-surface rounded-2xl p-4 card-hover card-press border border-card-border cursor-pointer"
            onClick={() => navigate('/analytics')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center mb-3">
                <BarChart3 size={18} className="text-white" />
              </div>
              <h4 className="font-medium text-primary-dark text-sm mb-1">NETS</h4>
              <h4 className="font-semibold text-xs">Analytics</h4>
            </div>
          </div>

          <div 
            className="bg-surface rounded-2xl p-4 card-hover card-press border border-card-border cursor-pointer"
            onClick={() => navigate('/referrals')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-white" />
              </div>
              <h4 className="font-medium text-gold text-sm mb-1">Referrals</h4>
              <h4 className="font-semibold text-xs">Earn</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;