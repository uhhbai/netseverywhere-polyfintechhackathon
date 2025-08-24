-- Add sample transactions for current user to show activity
INSERT INTO transactions (user_id, merchant_name, amount, transaction_type, description, created_at) 
SELECT 
  auth.uid(),
  unnest(ARRAY['Starbucks', 'McDonald''s', 'NTUC FairPrice', 'Din Tai Fung', 'Grab Transport', 'Uniqlo', 'Golden Village', 'Toast Box']),
  unnest(ARRAY[8.50, 12.90, 45.30, 68.40, 15.60, 89.90, 28.00, 6.80]),
  'payment',
  unnest(ARRAY['Coffee and pastry', 'Lunch meal', 'Grocery shopping', 'Dinner with friends', 'Ride to office', 'New shirt', 'Movie tickets', 'Breakfast']),
  now() - (unnest(ARRAY[2, 3, 24, 48, 5, 72, 168, 6]) * interval '1 hour')
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;