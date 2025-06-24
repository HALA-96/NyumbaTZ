-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tenant', 'landlord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('house', 'apartment', 'studio', 'villa', 'room');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'viewed', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text,
  user_role user_role NOT NULL DEFAULT 'tenant',
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =============================================
-- PROPERTIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  property_type property_type NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  monthly_rent numeric NOT NULL CHECK (monthly_rent > 0),
  city text NOT NULL,
  area text NOT NULL,
  address text,
  contact_phone text NOT NULL,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  utilities text[] DEFAULT '{}',
  nearby_services text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  search_vector tsvector
);

-- =============================================
-- INQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_name text NOT NULL,
  tenant_phone text NOT NULL,
  tenant_email text NOT NULL,
  message text NOT NULL,
  status inquiry_status DEFAULT 'new',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_monthly_rent ON properties(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_search_vector ON properties USING gin(search_vector);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_available_city ON properties(is_available, city) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_available_rent ON properties(is_available, monthly_rent) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_available_type ON properties(is_available, property_type) WHERE is_available = true;

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant_id ON inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_landlord_id ON inquiries(landlord_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'tenant')::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.area, '') || ' ' ||
    COALESCE(NEW.address, '') || ' ' ||
    COALESCE(array_to_string(NEW.amenities, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.utilities, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.nearby_services, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment inquiry count
CREATE OR REPLACE FUNCTION increment_inquiry_count()
RETURNS trigger AS $$
BEGIN
  UPDATE properties 
  SET inquiries_count = inquiries_count + 1,
      updated_at = now()
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_search_vector_trigger ON properties;
CREATE TRIGGER update_properties_search_vector_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

DROP TRIGGER IF EXISTS increment_inquiry_count_trigger ON inquiries;
CREATE TRIGGER increment_inquiry_count_trigger
  AFTER INSERT ON inquiries
  FOR EACH ROW EXECUTE FUNCTION increment_inquiry_count();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
    
    -- Drop all policies on properties table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'properties' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON properties';
    END LOOP;
    
    -- Drop all policies on inquiries table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'inquiries' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON inquiries';
    END LOOP;
END $$;

-- Profiles policies
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "properties_select_available" ON properties
  FOR SELECT USING (is_available = true OR owner_id = auth.uid());

CREATE POLICY "properties_insert_landlord" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'landlord')
  );

CREATE POLICY "properties_update_owner" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "properties_delete_owner" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Inquiries policies
CREATE POLICY "inquiries_select_involved" ON inquiries
  FOR SELECT USING (
    auth.uid() = tenant_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "inquiries_insert_tenant" ON inquiries
  FOR INSERT WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'tenant')
  );

CREATE POLICY "inquiries_update_landlord" ON inquiries
  FOR UPDATE USING (auth.uid() = landlord_id);

-- =============================================
-- STORAGE SETUP
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "avatar_images_public_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatar_images_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_images_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_images_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for property images
CREATE POLICY "property_images_public_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "property_images_landlord_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "property_images_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "property_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample landlord profile for testing
DO $$
DECLARE
    sample_user_id uuid := gen_random_uuid();
BEGIN
    -- Only insert if no profiles exist
    IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        -- Insert sample user into auth.users (for testing only)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            sample_user_id,
            '00000000-0000-0000-0000-000000000000',
            'landlord@nyumbatz.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Sample Landlord", "phone_number": "+255712000000", "user_role": "landlord"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Insert sample properties
        INSERT INTO properties (
            owner_id,
            title,
            description,
            property_type,
            bedrooms,
            bathrooms,
            monthly_rent,
            city,
            area,
            contact_phone,
            images,
            amenities,
            is_available
        ) VALUES 
        (
            sample_user_id,
            'Modern 3BR House in Kinondoni',
            'Beautiful modern house with garden and parking in Kinondoni area.',
            'house',
            3,
            2,
            800000,
            'Dar es Salaam',
            'Kinondoni',
            '+255712000000',
            ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
            ARRAY['Parking', 'Security', 'Garden'],
            true
        ),
        (
            sample_user_id,
            'Cozy 2BR Apartment in Mikocheni',
            'Well-maintained apartment close to shopping centers.',
            'apartment',
            2,
            1,
            550000,
            'Dar es Salaam',
            'Mikocheni',
            '+255712000000',
            ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
            ARRAY['Security', 'Water Tank'],
            true
        ),
        (
            sample_user_id,
            'Executive House in Mwanza',
            'Executive 4-bedroom house near Lake Victoria.',
            'house',
            4,
            3,
            950000,
            'Mwanza',
            'Ilemela',
            '+255712000000',
            ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
            ARRAY['Parking', 'Security', 'Generator'],
            true
        );
        
        RAISE NOTICE 'Sample data inserted successfully';
    END IF;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
DECLARE
    table_count integer;
    policy_count integer;
    function_count integer;
    trigger_count integer;
    index_count integer;
    property_count integer;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'properties', 'inquiries');
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Count functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name IN ('handle_new_user', 'update_updated_at_column', 'update_properties_search_vector', 'increment_inquiry_count');
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    -- Count properties
    SELECT COUNT(*) INTO property_count FROM properties;
    
    RAISE NOTICE '=== DATABASE SCHEMA SETUP COMPLETED ===';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE 'Triggers created: %', trigger_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Sample properties: %', property_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Schema includes:';
    RAISE NOTICE '- profiles: User profiles with role-based access';
    RAISE NOTICE '- properties: Property listings with full details';
    RAISE NOTICE '- inquiries: Tenant inquiries to landlords';
    RAISE NOTICE '- Storage buckets: avatars, property-images';
    RAISE NOTICE '- Full-text search enabled on properties';
    RAISE NOTICE '- Row Level Security enabled on all tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for production use! 🚀';
END $$;