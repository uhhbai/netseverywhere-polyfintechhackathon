import { Home, Users, Grid3X3 } from 'lucide-react';
import { useState } from 'react';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'more', label: 'More', icon: Grid3X3 }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-card-border">
      <div className="flex justify-around py-3 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
      
      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-foreground/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default BottomNavigation;