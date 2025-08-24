DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can create their own notifications'
  ) THEN
    CREATE POLICY "Users can create their own notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;