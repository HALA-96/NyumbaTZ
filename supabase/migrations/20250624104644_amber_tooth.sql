/*
  # Add amenities column to properties table

  1. Changes
    - Add `amenities` column to `properties` table as text array
    - Set default value to empty array
    - Update existing properties with sample amenities data

  2. Security
    - No changes to RLS policies needed
    - Column is nullable and has safe default
*/

-- Add amenities column to properties table
ALTER TABLE properties 
ADD COLUMN amenities text[] DEFAULT '{}';

-- Update existing properties with sample amenities based on property type and features
UPDATE properties 
SET amenities = CASE 
  WHEN property_type = 'villa' THEN 
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished']
  WHEN property_type = 'house' AND monthly_rent > 1000000 THEN 
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished']
  WHEN property_type = 'house' THEN 
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet']
  WHEN property_type = 'apartment' AND monthly_rent > 500000 THEN 
    ARRAY['Parking', 'Security', 'Water Tank', 'Internet', 'Balcony']
  WHEN property_type = 'apartment' THEN 
    ARRAY['Security', 'Water Tank', 'Internet']
  WHEN property_type = 'studio' THEN 
    ARRAY['Security', 'Internet']
  WHEN property_type = 'room' THEN 
    ARRAY['Security']
  ELSE 
    ARRAY['Security', 'Water Tank']
END
WHERE amenities IS NULL OR amenities = '{}';

-- Verify the update
DO $$
BEGIN
  RAISE NOTICE 'Amenities column added successfully!';
  RAISE NOTICE 'Updated % properties with amenities data', (SELECT COUNT(*) FROM properties WHERE array_length(amenities, 1) > 0);
END $$;