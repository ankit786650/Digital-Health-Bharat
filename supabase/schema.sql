
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table: Stores user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  email TEXT UNIQUE,
  phone_number TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions Table: Stores prescription details (can be linked to a visit or standalone)
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_visit_id UUID REFERENCES public.doctor_visits(id) ON DELETE SET NULL, -- Optional link to a visit
  prescription_date DATE NOT NULL,
  doctor_name TEXT,
  doctor_specialization TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor Visits Table: Stores information about doctor appointments
CREATE TABLE public.doctor_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_date DATE NOT NULL,
  doctor_name TEXT NOT NULL,
  specialization TEXT,
  reason_for_visit TEXT,
  notes TEXT, -- Clinical notes
  next_appointment_time TIME,
  next_appointment_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Reminders Table: Stores medication reminder details
CREATE TABLE public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE, -- Link to a specific prescription
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  dosage_form TEXT, -- e.g., tablet, capsule, syrup
  frequency TEXT NOT NULL, -- General frequency, e.g., "Once a day"
  specific_times JSONB, -- Array of HH:mm strings, e.g., ["08:00", "20:00"]
  start_date DATE NOT NULL,
  duration_value INT,
  duration_unit TEXT, -- e.g., days, weeks, months, no_end_date
  instructions TEXT,
  refill_reminder_enabled BOOLEAN DEFAULT FALSE,
  refill_days_before_empty INT,
  medication_shape TEXT, -- e.g., round, oval
  is_generated BOOLEAN DEFAULT FALSE, -- True if AI generated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Documents Table: Stores uploaded medical documents
CREATE TABLE public.medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_visit_id UUID REFERENCES public.doctor_visits(id) ON DELETE SET NULL, -- Optional link to a visit
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL, -- Optional link to a prescription
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- e.g., lab_report, prescription_scan, imaging
  document_date DATE,
  storage_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage
  file_name TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_prescriptions_updated
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_doctor_visits_updated
  BEFORE UPDATE ON public.doctor_visits
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_medication_reminders_updated
  BEFORE UPDATE ON public.medication_reminders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_medical_documents_updated
  BEFORE UPDATE ON public.medical_documents
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- Example Row Level Security (RLS) policies (adjust as needed)
-- Make sure to enable RLS for each table in the Supabase dashboard.

-- For profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and edit their own profile."
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- For prescriptions table
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own prescriptions."
  ON public.prescriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = prescriptions.user_id AND profiles.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = prescriptions.user_id AND profiles.user_id = auth.uid()));

-- For doctor_visits table
ALTER TABLE public.doctor_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own doctor visits."
  ON public.doctor_visits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = doctor_visits.user_id AND profiles.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = doctor_visits.user_id AND profiles.user_id = auth.uid()));

-- For medication_reminders table
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own medication reminders."
  ON public.medication_reminders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = medication_reminders.user_id AND profiles.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = medication_reminders.user_id AND profiles.user_id = auth.uid()));

-- For medical_documents table
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own medical documents."
  ON public.medical_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = medical_documents.user_id AND profiles.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = medical_documents.user_id AND profiles.user_id = auth.uid()));

-- Note on Supabase Storage:
-- You will need to create a bucket (e.g., 'medical_documents') in Supabase Storage.
-- Configure appropriate policies for the bucket to allow authenticated users to upload/download their own documents.
-- Example policy for a bucket named 'medical_documents' (this goes in Supabase Storage policies, not SQL Editor):
-- For SELECT (Download): (bucket_id = 'medical_documents' AND auth.uid() = (storage.foldername(name))[1])
-- For INSERT (Upload): (bucket_id = 'medical_documents' AND auth.uid() = (storage.foldername(name))[1])
-- This assumes you store files in user-specific folders like: `user_uuid/document_name.pdf`
-- The storage_path in medical_documents table would then be 'user_uuid/document_name.pdf'

