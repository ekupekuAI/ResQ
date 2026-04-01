-- ResQ Supabase Schema definition
-- Run this in your Supabase SQL Editor

-- Create Societies Table
CREATE TABLE public.societies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  society_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id UUID NOT NULL
);

-- Enable RLS for societies
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check a society_code to join" 
ON public.societies FOR SELECT 
USING (true);

CREATE POLICY "Admins can create societies" 
ON public.societies FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

-- Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  flat TEXT,
  floor TEXT,
  role TEXT NOT NULL CHECK (role IN ('resident', 'admin', 'guard')),
  society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles in their society" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.societies s
    WHERE s.id = profiles.society_id
    AND s.admin_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create Alerts Table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('fire', 'medical', 'gas', 'theft', 'flood', 'other')),
  flat TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read alerts for their society"
ON public.alerts FOR SELECT
USING (society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Residents can create alerts for their society"
ON public.alerts FOR INSERT
WITH CHECK (society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admin or alert creator can resolve alerts"
ON public.alerts FOR UPDATE
USING (
  auth.uid() = sent_by OR 
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND society_id = alerts.society_id)
);

-- Create Responses Table (Helping / Safe)
CREATE TABLE public.responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('helping', 'safe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(alert_id, user_id, type)
);

-- Enable RLS for responses
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read responses for their society's alerts"
ON public.responses FOR SELECT
USING (EXISTS(
  SELECT 1 FROM public.alerts 
  WHERE alerts.id = alert_id 
  AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
));

CREATE POLICY "Users can insert responses to their society's alerts"
ON public.responses FOR INSERT
WITH CHECK (EXISTS(
  SELECT 1 FROM public.alerts 
  WHERE alerts.id = alert_id 
  AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
));

-- Create Announcements Table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read announcements for their society"
ON public.announcements FOR SELECT
USING (society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can create announcements"
ON public.announcements FOR INSERT
WITH CHECK (EXISTS(
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin' AND society_id = announcements.society_id
));
