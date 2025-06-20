
-- Update the site name in admin settings
UPDATE public.admin_settings 
SET setting_value = 'Andy Shoots' 
WHERE setting_key = 'site_name';

-- Insert if it doesn't exist
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES ('site_name', 'Andy Shoots')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'Andy Shoots';
