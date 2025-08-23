import { Home, Users, Grid3X3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'social', label: 'Social', icon: Users, path: '/leaderboard' },
    { id: 'more', label: 'More', icon: Grid3X3, path: '/analytics' }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeTab = tabs.find(tab => tab.path === currentPath);
    return activeTab?.id || 'home';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-card-border">
      <div className="flex justify-around py-3 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = getActiveTab() === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-hover'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;