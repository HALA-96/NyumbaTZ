/*
  # Fix Foreign Key Relationships

  1. Database Changes
    - Update properties table to reference profiles instead of auth.users directly
    - Add proper foreign key constraint between properties.owner_id and profiles.id
    - Ensure profiles table has proper structure

  2. Security
    - Maintain existing RLS policies
    - Update policies to work with new relationship structure
*/

-- First, ensure the profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  user_role user_role NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Update properties table structure if needed
DO $$
BEGIN
  -- Check if properties table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
    CREATE TABLE properties (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      title text NOT NULL,
      description text,
      property_type property_type NOT NULL,
      bedrooms integer NOT NULL,
      bathrooms integer NOT NULL,
      monthly_rent numeric NOT NULL,
      city text NOT NULL,
      area text NOT NULL,
      contact_phone text NOT NULL,
      images text[] DEFAULT '{}',
      is_available boolean DEFAULT true,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      search_vector tsvector
    );
  ELSE
    -- If table exists, check and update the foreign key constraint
    -- First, drop the existing constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'properties' 
      AND constraint_name = 'properties_owner_id_fkey'
    ) THEN
      ALTER TABLE properties DROP CONSTRAINT properties_owner_id_fkey;
    END IF;
    
    -- Add the correct foreign key constraint
    ALTER TABLE properties 
    ADD CONSTRAINT properties_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Update properties policies
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Landlords can insert properties" ON properties;
DROP POLICY IF EXISTS "Landlords can update own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can delete own properties" ON properties;

CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Landlords can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Landlords can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Landlords can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Create search index if it doesn't exist
CREATE INDEX IF NOT EXISTS properties_search_idx ON properties USING gin(search_vector);

-- Create or replace the search vector update function
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.city, '') || ' ' ||
    coalesce(NEW.area, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS update_properties_search_vector_trigger ON properties;
CREATE TRIGGER update_properties_search_vector_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- Ensure inquiries table has correct structure
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_name text NOT NULL,
  tenant_phone text NOT NULL,
  message text NOT NULL,
  status inquiry_status DEFAULT 'new',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Update inquiries policies
DROP POLICY IF EXISTS "Landlords can view inquiries for their properties" ON inquiries;
DROP POLICY IF EXISTS "Tenants can view their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Tenants can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Landlords can update inquiry status" ON inquiries;

CREATE POLICY "Landlords can view inquiries for their properties" ON inquiries
  FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view their own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can update inquiry status" ON inquiries
  FOR UPDATE USING (auth.uid() = landlord_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'tenant')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();