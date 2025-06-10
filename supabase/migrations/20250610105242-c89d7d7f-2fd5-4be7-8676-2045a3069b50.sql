
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);

-- Create RLS policies for the storage bucket
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Only super admins can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Update images table to include storage_path
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create function to get featured images for slideshow
CREATE OR REPLACE FUNCTION public.get_featured_slideshow_images()
RETURNS TABLE (
  id UUID,
  title TEXT,
  url TEXT,
  storage_path TEXT,
  project_id UUID,
  project_title TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    i.id,
    i.title,
    i.url,
    i.storage_path,
    i.project_id,
    p.title as project_title
  FROM public.images i
  LEFT JOIN public.projects p ON i.project_id = p.id
  WHERE p.featured = true OR i.project_id IS NULL
  ORDER BY i.created_at DESC
  LIMIT 10;
$$;
