import React from 'react';
import { ArrowLeft, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showBack = false, onBack }: HeaderProps) => {
  const { signOut } = useAuth();

  return (
    <header className="bg-surface px-6 py-4 flex items-center justify-between border-b border-card-border">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-hover transition-colors"
          >
            <ArrowLeft size={20} className="text-primary" />
          </button>
        ) : (
          <button 
            onClick={signOut}
            className="p-2 -ml-2 rounded-xl hover:bg-hover transition-colors"
          >
            <LogOut size={20} className="text-primary" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-hover transition-colors relative">
          <Bell size={20} className="text-muted-foreground" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface"></div>
        </button>
        <button className="p-2 rounded-xl hover:bg-hover transition-colors">
          <User size={20} className="text-primary" />
        </button>
      </div>
    </header>
  );
};

export default Header;