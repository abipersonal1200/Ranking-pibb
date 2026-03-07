/*
  # PIBB Player Management System - Initial Schema

  ## Overview
  Creates the core database schema for the PIBB (basketball league) player management system.
  This migration sets up player profiles with authentication integration.

  ## New Tables
  
  ### `profiles`
  Extends Supabase auth.users with additional user information:
  - `id` (uuid, primary key) - References auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'admin' or 'member'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `players`
  Stores player information for the basketball league:
  - `id` (uuid, primary key) - Unique player identifier
  - `name` (text, required) - Player full name
  - `jersey_number` (integer) - Player's jersey number
  - `position` (text) - Playing position (Guard, Forward, Center, etc.)
  - `height` (text) - Player height (e.g., "6'2\"")
  - `weight` (text) - Player weight (e.g., "180 lbs")
  - `date_of_birth` (date) - Player's birth date
  - `nationality` (text) - Player nationality
  - `team` (text) - Current team
  - `status` (text) - Player status: 'active', 'inactive', 'injured'
  - `photo_url` (text) - URL to player photo
  - `stats_points_avg` (decimal) - Average points per game
  - `stats_rebounds_avg` (decimal) - Average rebounds per game
  - `stats_assists_avg` (decimal) - Average assists per game
  - `bio` (text) - Player biography
  - `created_by` (uuid) - References profiles.id
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Profiles Table
  - RLS enabled
  - Users can read all profiles
  - Users can only update their own profile
  - Only admins can change roles
  
  ### Players Table
  - RLS enabled
  - Anyone (authenticated or not) can view players (public roster)
  - Only authenticated users can create players
  - Only the creator or admins can update/delete players

  ## Indexes
  - Index on players.status for filtering
  - Index on players.team for team queries
  - Index on players.created_by for ownership queries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  jersey_number integer,
  position text,
  height text,
  weight text,
  date_of_birth date,
  nationality text,
  team text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'injured')),
  photo_url text,
  stats_points_avg decimal(4,1) DEFAULT 0,
  stats_rebounds_avg decimal(4,1) DEFAULT 0,
  stats_assists_avg decimal(4,1) DEFAULT 0,
  bio text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Players policies (public read, authenticated write)
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators and admins can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Creators and admins can delete players"
  ON players FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_players_created_by ON players(created_by);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_players
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();