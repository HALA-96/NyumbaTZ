/*
  # Add Foreign Key Constraint for Properties Owner

  1. Foreign Key Constraint
    - Add foreign key constraint linking properties.owner_id to profiles.id
    - This enables PostgREST automatic relationship detection
    - Ensures data integrity between properties and their owners

  2. Security
    - Maintains existing RLS policies
    - No changes to existing permissions

  3. Performance
    - Adds index on owner_id for better join performance
*/

-- Add foreign key constraint linking properties to profiles
ALTER TABLE public.properties
ADD CONSTRAINT fk_properties_owner
FOREIGN KEY (owner_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

-- Add index on owner_id for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties (owner_id);

-- Ensure the profiles table exists and has the correct structure
-- (This is a safety check - the table should already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'profiles table does not exist. Please ensure the profiles table is created first.';
  END IF;
END $$;