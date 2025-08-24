-- Allow users to create their own notifications
CREATE POLICY IF NOT EXISTS "Users can create their own notifications"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);