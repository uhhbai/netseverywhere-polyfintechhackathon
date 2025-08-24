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

-- Update current user's balance for presentation
UPDATE profiles 
SET balance = 850.75, total_spent = 2500.00, streak_count = 12 
WHERE user_id = auth.uid();