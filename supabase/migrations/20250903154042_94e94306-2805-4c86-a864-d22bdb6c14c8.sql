-- Add points column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN points DOUBLE PRECISION DEFAULT 0;