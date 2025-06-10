
-- Add new columns to images table for metadata and engagement
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS camera_model TEXT;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS aperture TEXT;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS focal_length TEXT;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS iso TEXT;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create table for image reactions
CREATE TABLE IF NOT EXISTS public.image_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(image_id, reaction_type, user_id),
  UNIQUE(image_id, reaction_type, session_id)
);

-- Enable RLS on image_reactions
ALTER TABLE public.image_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for image_reactions
CREATE POLICY "Anyone can view reactions" ON public.image_reactions
FOR SELECT USING (true);

CREATE POLICY "Anyone can add reactions" ON public.image_reactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reactions" ON public.image_reactions
FOR UPDATE USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users can delete their own reactions" ON public.image_reactions
FOR DELETE USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_image_view_count(image_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.images 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = image_id;
END;
$$;

-- Function to get reaction counts for an image
CREATE OR REPLACE FUNCTION public.get_image_reaction_counts(image_id UUID)
RETURNS TABLE (
  like_count BIGINT,
  love_count BIGINT,
  wow_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0) as like_count,
    COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0) as love_count,
    COALESCE(SUM(CASE WHEN reaction_type = 'wow' THEN 1 ELSE 0 END), 0) as wow_count
  FROM public.image_reactions 
  WHERE image_id = get_image_reaction_counts.image_id;
$$;
