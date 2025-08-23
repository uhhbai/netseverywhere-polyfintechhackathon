-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  streak_count INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table for receipts and payments
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'top_up', 'refund', 'group_payment')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  receipt_url TEXT,
  group_pay_session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_pay_sessions table
CREATE TABLE public.group_pay_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  split_method TEXT DEFAULT 'equal' CHECK (split_method IN ('equal', 'custom', 'percentage')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_pay_participants table
CREATE TABLE public.group_pay_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.group_pay_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_name TEXT,
  amount_owed DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create promos table
CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  merchant_name TEXT,
  image_url TEXT,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  promo_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_promo_usage table
CREATE TABLE public.user_promo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  promo_id UUID REFERENCES public.promos(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  savings_amount DECIMAL(10,2),
  UNIQUE(user_id, promo_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'special')),
  target_value INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 0,
  reward_amount DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_challenge_progress table
CREATE TABLE public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referee_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_amount DECIMAL(10,2) DEFAULT 10.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'general' CHECK (notification_type IN ('general', 'payment', 'group_pay', 'promo', 'challenge', 'referral')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_pay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_pay_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for group_pay_sessions
CREATE POLICY "Users can view group sessions they created or participate in" ON public.group_pay_sessions
  FOR SELECT USING (
    auth.uid() = creator_id OR 
    EXISTS (SELECT 1 FROM public.group_pay_participants WHERE session_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create group sessions" ON public.group_pay_sessions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own group sessions" ON public.group_pay_sessions
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for group_pay_participants
CREATE POLICY "Users can view participants in sessions they're part of" ON public.group_pay_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_pay_sessions WHERE id = session_id AND 
    (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.group_pay_participants p WHERE p.session_id = session_id AND p.user_id = auth.uid())))
  );
CREATE POLICY "Session creators can manage participants" ON public.group_pay_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_pay_sessions WHERE id = session_id AND creator_id = auth.uid())
  );

-- RLS Policies for promos (public read)
CREATE POLICY "Everyone can view active promos" ON public.promos
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_promo_usage
CREATE POLICY "Users can view their own promo usage" ON public.user_promo_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own promo usage" ON public.user_promo_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenges (public read)
CREATE POLICY "Everyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge progress" ON public.user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.promos (title, description, discount_percentage, merchant_name, image_url, valid_until, max_uses, promo_code) VALUES
('20% Off Coffee', 'Get 20% off your next coffee purchase', 20, 'Starbucks', '/placeholder.svg', now() + interval '30 days', 100, 'COFFEE20'),
('Free Delivery', 'Free delivery on orders above $30', null, 'FoodPanda', '/placeholder.svg', now() + interval '14 days', 500, 'FREEDEL'),
('$5 Off Shopping', 'Get $5 off your next grocery shopping', null, 'FairPrice', '/placeholder.svg', now() + interval '21 days', 200, 'GROCERY5');

INSERT INTO public.challenges (title, description, challenge_type, target_value, reward_points, reward_amount) VALUES
('Daily Spender', 'Make 3 transactions today', 'daily', 3, 50, 2.00),
('Weekly Saver', 'Use 2 promos this week', 'weekly', 2, 100, 5.00),
('Monthly Explorer', 'Try 5 different merchants this month', 'monthly', 5, 200, 10.00);