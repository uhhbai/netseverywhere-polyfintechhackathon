-- Add receipt-related columns to group_pay_sessions
ALTER TABLE public.group_pay_sessions 
ADD COLUMN IF NOT EXISTS receipt_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0.00;

-- Create receipt items table for detailed tracking
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.group_pay_sessions(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER DEFAULT 1,
  selected_by_users UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on receipt_items
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for receipt_items
CREATE POLICY "Users can view receipt items for sessions they're part of"
ON public.receipt_items FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.group_pay_sessions 
    WHERE creator_id = auth.uid() 
    OR id IN (
      SELECT session_id FROM public.group_pay_participants 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Session creators can manage receipt items"
ON public.receipt_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.group_pay_sessions 
    WHERE id = receipt_items.session_id AND creator_id = auth.uid()
  )
);

-- Add more demo data functions
CREATE OR REPLACE FUNCTION public.seed_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create sample profiles for demo leaderboard
  INSERT INTO public.profiles (user_id, display_name, balance, total_spent, streak_count)
  VALUES 
    (gen_random_uuid(), 'Sarah Chen', 1250.50, 3200.00, 25),
    (gen_random_uuid(), 'Alex Kumar', 850.75, 2800.50, 18),
    (gen_random_uuid(), 'Rachel Wong', 2100.20, 5500.75, 42),
    (gen_random_uuid(), 'David Lim', 650.30, 1950.25, 12),
    (gen_random_uuid(), 'Emily Tan', 1850.45, 4200.80, 38),
    (gen_random_uuid(), 'Marcus Lee', 920.15, 2650.40, 22),
    (gen_random_uuid(), 'Priya Singh', 1350.60, 3750.90, 31),
    (gen_random_uuid(), 'Jordan Ng', 750.85, 2100.30, 15),
    (gen_random_uuid(), 'Lisa Kim', 1650.20, 4100.65, 28),
    (gen_random_uuid(), 'Ryan Teo', 1050.40, 2950.15, 19)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;