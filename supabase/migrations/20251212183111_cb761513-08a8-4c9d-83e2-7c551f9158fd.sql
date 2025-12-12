-- Create thumbnails table to store generation history
CREATE TABLE public.thumbnails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text_input TEXT NOT NULL,
  image_url TEXT,
  template_used TEXT NOT NULL,
  overlay_text TEXT,
  text_position TEXT DEFAULT 'center',
  text_style JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own thumbnails" 
ON public.thumbnails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own thumbnails" 
ON public.thumbnails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thumbnails" 
ON public.thumbnails 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thumbnails" 
ON public.thumbnails 
FOR DELETE 
USING (auth.uid() = user_id);

-- Also allow public read for demo (optional, remove if you want private only)
CREATE POLICY "Allow anonymous insert for demo" 
ON public.thumbnails 
FOR INSERT 
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous view own thumbnails" 
ON public.thumbnails 
FOR SELECT 
USING (user_id IS NULL);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();