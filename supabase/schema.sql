-- SheetAPI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table (Main project metadata)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Endpoints Table (API endpoint configuration per sheet)
CREATE TABLE IF NOT EXISTS endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  sheet_name TEXT NOT NULL,
  is_get_enabled BOOLEAN DEFAULT true,
  is_post_enabled BOOLEAN DEFAULT false,
  is_put_enabled BOOLEAN DEFAULT false,
  is_delete_enabled BOOLEAN DEFAULT false,
  UNIQUE(project_id, sheet_name)
);

-- 3. Project Authentication Table (API security configuration)
CREATE TABLE IF NOT EXISTS project_auth (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'basic', 'bearer')),
  auth_config JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_endpoints_project_id ON endpoints(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_auth ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for endpoints table
CREATE POLICY "Users can view endpoints of their projects"
  ON endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = endpoints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert endpoints for their projects"
  ON endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = endpoints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update endpoints of their projects"
  ON endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = endpoints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete endpoints of their projects"
  ON endpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = endpoints.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for project_auth table
CREATE POLICY "Users can view auth config of their projects"
  ON project_auth FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_auth.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert auth config for their projects"
  ON project_auth FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_auth.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update auth config of their projects"
  ON project_auth FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_auth.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete auth config of their projects"
  ON project_auth FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_auth.project_id
      AND projects.user_id = auth.uid()
    )
  );
