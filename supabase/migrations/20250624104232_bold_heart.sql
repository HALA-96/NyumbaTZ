/*
  # Add Sample Data for Testing

  1. Sample Data
    - Create a fake user account
    - Add sample properties for the listing page
    - Include realistic Tanzanian property data

  2. Data Includes
    - Landlord user profile
    - Multiple properties across different cities
    - Realistic pricing and descriptions
    - Property images from Pexels
*/

-- Insert a sample user (landlord)
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
  role,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000',
  'landlord@nyumbatz.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Mwalimu Juma", "phone_number": "+255712345678", "user_role": "landlord"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert profile for the sample user
INSERT INTO profiles (
  id,
  full_name,
  phone_number,
  user_role,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Mwalimu Juma',
  '+255712345678',
  'landlord',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample properties
INSERT INTO properties (
  id,
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
  is_available,
  created_at,
  updated_at
) VALUES 
-- Property 1: Luxury house in Dar es Salaam
(
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440000',
  'Modern 3BR House in Masaki',
  'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities including air conditioning, generator backup, and 24/7 security.',
  'house',
  3,
  2,
  1200000,
  'Dar es Salaam',
  'Masaki',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '2 days',
  now() - interval '2 days'
),

-- Property 2: Apartment in Kinondoni
(
  '22222222-2222-2222-2222-222222222222',
  '550e8400-e29b-41d4-a716-446655440000',
  'Cozy 2BR Apartment in Mikocheni',
  'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport. Features include parking space, water tank, and reliable internet connection.',
  'apartment',
  2,
  1,
  550000,
  'Dar es Salaam',
  'Mikocheni',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '1 day',
  now() - interval '1 day'
),

-- Property 3: Villa in Oyster Bay
(
  '33333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440000',
  'Luxury Villa in Oyster Bay',
  'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, swimming pool, and top-notch security. Perfect for executives and diplomats.',
  'villa',
  4,
  3,
  2500000,
  'Dar es Salaam',
  'Oyster Bay',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '3 days',
  now() - interval '3 days'
),

-- Property 4: House in Mwanza
(
  '44444444-4444-4444-4444-444444444444',
  '550e8400-e29b-41d4-a716-446655440000',
  'Executive House in Mwanza City',
  'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family. Features include large compound, parking for 3 cars, generator, and beautiful lake views.',
  'house',
  4,
  3,
  800000,
  'Mwanza',
  'Ilemela',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '4 days',
  now() - interval '4 days'
),

-- Property 5: Studio in Mbeya
(
  '55555555-5555-5555-5555-555555555555',
  '550e8400-e29b-41d4-a716-446655440000',
  'Modern Studio in Mbeya',
  'Compact modern studio apartment perfect for students and young professionals in Mbeya. Features include kitchenette, private bathroom, and reliable internet.',
  'studio',
  1,
  1,
  280000,
  'Mbeya',
  'Mbeya Urban',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '5 days',
  now() - interval '5 days'
),

-- Property 6: House in Arusha
(
  '66666666-6666-6666-6666-666666666666',
  '550e8400-e29b-41d4-a716-446655440000',
  'Safari Lodge Style House in Arusha',
  'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru with stunning mountain views. Features include fireplace, large garden, and traditional Tanzanian architecture.',
  'house',
  3,
  2,
  950000,
  'Arusha',
  'Arusha Central',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '6 days',
  now() - interval '6 days'
),

-- Property 7: Apartment in Mbeya
(
  '77777777-7777-7777-7777-777777777777',
  '550e8400-e29b-41d4-a716-446655440000',
  'Family Apartment in Mbeya Highlands',
  'Spacious 3-bedroom apartment in the cool highlands of Mbeya. Perfect for families with children. Features include balcony with mountain views, parking, and proximity to schools.',
  'apartment',
  3,
  2,
  450000,
  'Mbeya',
  'Mbeya Highlands',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '7 days',
  now() - interval '7 days'
),

-- Property 8: Room in Dar es Salaam
(
  '88888888-8888-8888-8888-888888888888',
  '550e8400-e29b-41d4-a716-446655440000',
  'Single Room in Temeke',
  'Affordable single room in Temeke area. Perfect for students and young professionals. Shared bathroom and kitchen facilities. Close to public transport and markets.',
  'room',
  1,
  1,
  180000,
  'Dar es Salaam',
  'Temeke',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '8 days',
  now() - interval '8 days'
),

-- Property 9: House in Morogoro
(
  '99999999-9999-9999-9999-999999999999',
  '550e8400-e29b-41d4-a716-446655440000',
  'University Area House in Morogoro',
  'Perfect for university staff and families. 3-bedroom house near Sokoine University of Agriculture. Features include large compound, fruit trees, and quiet neighborhood.',
  'house',
  3,
  2,
  600000,
  'Morogoro',
  'University Area',
  '+255712345678',
  ARRAY[
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  true,
  now() - interval '9 days',
  now() - interval '9 days'
);

-- Update search vectors for all properties
UPDATE properties SET search_vector = to_tsvector('english', 
  coalesce(title, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(city, '') || ' ' ||
  coalesce(area, '')
);

-- Verify the data was inserted
DO $$
BEGIN
  RAISE NOTICE 'Sample data migration completed successfully!';
  RAISE NOTICE 'Created 1 sample user: landlord@nyumbatz.com (password: password123)';
  RAISE NOTICE 'Created % sample properties', (SELECT COUNT(*) FROM properties);
  RAISE NOTICE 'Properties are now available on the listing page';
END $$;