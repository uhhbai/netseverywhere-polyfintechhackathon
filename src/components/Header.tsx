import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showBack = false, onBack }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Add sample notifications for current user if none exist
      addSampleNotifications();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const addSampleNotifications = async () => {
    try {
      // Check if user already has notifications
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (existing && existing.length > 0) return; // User already has notifications

      // Add sample notifications
      const sampleNotifications = [
        {
          user_id: user?.id,
          title: 'Payment Received',
          message: 'You received $50.00 from Alex Chen for dinner split',
          notification_type: 'payment',
          action_url: '/transactions',
          is_read: false
        },
        {
          user_id: user?.id,
          title: 'GroupPay Request',
          message: 'Sarah Tan invited you to split the bill for Birthday Celebration',
          notification_type: 'grouppay',
          action_url: '/grouppay',
          is_read: false
        },
        {
          user_id: user?.id,
          title: 'Cashback Earned',
          message: 'You earned $2.50 cashback from your Starbucks purchase',
          notification_type: 'cashback',
          action_url: '/cashback',
          is_read: true
        },
        {
          user_id: user?.id,
          title: 'Streak Achievement',
          message: 'Congratulations! You\'ve reached a 12-day payment streak 🔥',
          notification_type: 'achievement',
          action_url: '/streak',
          is_read: true
        },
        {
          user_id: user?.id,
          title: 'Referral Bonus',
          message: 'Your friend Mike joined NETS! You both received $10 bonus',
          notification_type: 'referral',
          action_url: '/referrals',
          is_read: false
        }
      ];

      await supabase
        .from('notifications')
        .insert(sampleNotifications);

      fetchUnreadCount(); // Refresh count
    } catch (error) {
      console.error('Error adding sample notifications:', error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 bg-background border-b border-card-border">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1 rounded-lg hover:bg-hover transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-xl hover:bg-hover transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
          >
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>
        </div>
      </div>

      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount(); // Refresh count when closing
        }}
      />
    </>
  );
};

export default Header;