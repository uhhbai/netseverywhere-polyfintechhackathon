-- Fix GroupPay RLS policy infinite recursion issue
DROP POLICY IF EXISTS "Users can view participants in sessions they're part of" ON group_pay_participants;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view participants in their sessions" 
ON group_pay_participants 
FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM group_pay_sessions 
    WHERE creator_id = auth.uid()
  ) 
  OR user_id = auth.uid()
);

-- Add fake users and data for presentation
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'alex.chen@example.com', '{"display_name": "Alex Chen"}', now(), now()),
('22222222-2222-2222-2222-222222222222', 'sarah.tan@example.com', '{"display_name": "Sarah Tan"}', now(), now()),
('33333333-3333-3333-3333-333333333333', 'mike.wong@example.com', '{"display_name": "Mike Wong"}', now(), now()),
('44444444-4444-4444-4444-444444444444', 'jenny.lim@example.com', '{"display_name": "Jenny Lim"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for fake users
INSERT INTO profiles (user_id, display_name, balance, total_spent, streak_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Alex Chen', 250.50, 1200.00, 15),
('22222222-2222-2222-2222-222222222222', 'Sarah Tan', 180.30, 950.75, 22),
('33333333-3333-3333-3333-333333333333', 'Mike Wong', 420.80, 2100.40, 8),
('44444444-4444-4444-4444-444444444444', 'Jenny Lim', 95.25, 650.20, 35)
ON CONFLICT (user_id) DO NOTHING;

-- Add sample transactions
INSERT INTO transactions (user_id, merchant_name, amount, transaction_type, description, created_at) VALUES
-- Recent transactions for current user's friends
('11111111-1111-1111-1111-111111111111', 'Starbucks', 8.50, 'payment', 'Coffee and pastry', now() - interval '2 hours'),
('22222222-2222-2222-2222-222222222222', 'NTUC FairPrice', 45.30, 'payment', 'Grocery shopping', now() - interval '1 day'),
('33333333-3333-3333-3333-333333333333', 'McDonald''s', 12.90, 'payment', 'Lunch meal', now() - interval '3 hours'),
('44444444-4444-4444-4444-444444444444', 'Grab Transport', 15.60, 'payment', 'Ride to office', now() - interval '5 hours'),
('11111111-1111-1111-1111-111111111111', 'Din Tai Fung', 68.40, 'payment', 'Dinner with friends', now() - interval '2 days'),
('22222222-2222-2222-2222-222222222222', 'Uniqlo', 89.90, 'payment', 'New shirt', now() - interval '3 days'),
('33333333-3333-3333-3333-333333333333', 'Golden Village', 28.00, 'payment', 'Movie tickets', now() - interval '1 week'),
('44444444-4444-4444-4444-444444444444', 'Toast Box', 6.80, 'payment', 'Breakfast', now() - interval '6 hours');

-- Add sample group pay sessions
INSERT INTO group_pay_sessions (id, creator_id, session_name, total_amount, status, expires_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Team Lunch at Din Tai Fung', 120.50, 'active', now() + interval '20 hours'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Birthday Dinner Celebration', 280.90, 'active', now() + interval '15 hours'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Weekend Movie Night', 65.00, 'completed', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- Add sample group pay participants
INSERT INTO group_pay_participants (session_id, user_id, participant_name, amount_owed, amount_paid, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Alex Chen', 30.13, 30.13, 'paid'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Sarah Tan', 30.13, 0.00, 'pending'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Mike Wong', 30.12, 30.12, 'paid'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Jenny Lim', 30.12, 0.00, 'pending'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Sarah Tan', 70.23, 70.23, 'paid'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Alex Chen', 70.22, 0.00, 'pending'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Mike Wong', 70.22, 70.22, 'paid'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'Jenny Lim', 70.23, 0.00, 'pending')
ON CONFLICT (user_id, session_id) DO NOTHING;

-- Add sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, action_url, is_read) VALUES
-- Sample notifications for demo
('11111111-1111-1111-1111-111111111111', 'Payment Received', 'You received $50.00 from Sarah Tan for dinner', 'payment', '/transactions', false),
('11111111-1111-1111-1111-111111111111', 'GroupPay Request', 'Mike Wong invited you to split the bill for Movie Night', 'grouppay', '/grouppay', false),
('11111111-1111-1111-1111-111111111111', 'Cashback Earned', 'You earned $2.50 cashback from your Starbucks purchase', 'cashback', '/cashback', true),
('11111111-1111-1111-1111-111111111111', 'Streak Achievement', 'Congratulations! You''ve reached a 7-day payment streak 🔥', 'achievement', '/streak', true),
('11111111-1111-1111-1111-111111111111', 'Referral Bonus', 'Your friend joined NETS! You both received $10 bonus', 'referral', '/referrals', false);