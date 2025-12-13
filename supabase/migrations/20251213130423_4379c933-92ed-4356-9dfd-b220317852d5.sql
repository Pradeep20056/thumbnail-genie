-- Add credits and plan fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expiry timestamp with time zone;

-- Create user_roles table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create payments table to track transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL DEFAULT 'INR',
    plan_type text NOT NULL,
    payment_provider text NOT NULL DEFAULT 'stripe',
    payment_id text,
    payment_status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check if user has active paid plan
CREATE OR REPLACE FUNCTION public.has_active_plan(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND plan_type IN ('weekly', 'monthly')
      AND plan_expiry > now()
  )
$$;

-- Function to deduct credits (returns true if successful)
CREATE OR REPLACE FUNCTION public.deduct_credits(_user_id uuid, _amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
  has_plan boolean;
BEGIN
  -- Check if user has active paid plan
  SELECT public.has_active_plan(_user_id) INTO has_plan;
  
  -- If user has active plan, don't deduct credits
  IF has_plan THEN
    RETURN true;
  END IF;
  
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- Check if user has enough credits
  IF current_credits < _amount THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.profiles
  SET credits = credits - _amount
  WHERE user_id = _user_id;
  
  RETURN true;
END;
$$;

-- Function to get user credit status
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id uuid)
RETURNS TABLE (
  credits integer,
  plan_type text,
  plan_expiry timestamp with time zone,
  has_active_plan boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.credits,
    p.plan_type,
    p.plan_expiry,
    public.has_active_plan(_user_id) as has_active_plan
  FROM public.profiles p
  WHERE p.user_id = _user_id;
$$;

-- Update thumbnails table to track credits used
ALTER TABLE public.thumbnails
ADD COLUMN IF NOT EXISTS credits_used integer DEFAULT 10;

-- Update handle_new_user to include credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, credits, plan_type)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name', 50, 'free');
  RETURN new;
END;
$$;