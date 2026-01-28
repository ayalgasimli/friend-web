-- Run this SQL in your Supabase SQL Editor to add the new profile columns
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- Add new columns to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
