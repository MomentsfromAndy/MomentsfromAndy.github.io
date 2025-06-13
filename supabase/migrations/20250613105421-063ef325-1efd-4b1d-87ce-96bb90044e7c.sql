
-- Add folder support to images table
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'General';

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('site_name', 'PhotoFolio'),
  ('images_per_folder', '4'),
  ('admin_url', '/admin.andy')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "Anyone can view settings" ON public.admin_settings
FOR SELECT USING (true);

CREATE POLICY "Super admins can manage settings" ON public.admin_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Update super admin role for the special URL access
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'admin@photofolio.com'
AND role != 'super_admin';

-- Function to get admin settings
CREATE OR REPLACE FUNCTION public.get_admin_setting(key TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT setting_value FROM public.admin_settings WHERE setting_key = key LIMIT 1;
$$;
