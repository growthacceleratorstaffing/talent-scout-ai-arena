
-- Create enum for interview stages
CREATE TYPE interview_stage AS ENUM ('pending', 'in_progress', 'completed', 'passed', 'failed');

-- Create candidate_interviews table to track AI interview progress
CREATE TABLE public.candidate_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  job_id UUID NOT NULL,
  stage interview_stage NOT NULL DEFAULT 'pending',
  interview_data JSONB DEFAULT '{}',
  score INTEGER,
  verdict TEXT,
  interview_messages JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Enable RLS
ALTER TABLE public.candidate_interviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users to manage interviews
CREATE POLICY "Users can manage candidate interviews" 
  ON public.candidate_interviews 
  FOR ALL 
  USING (true);

-- Add interview_stage column to candidates table to track current stage
ALTER TABLE public.candidates 
ADD COLUMN interview_stage interview_stage DEFAULT 'pending';

-- Update existing recommended candidates to have pending interview stage
UPDATE public.candidates 
SET interview_stage = 'pending' 
WHERE id IN (
  SELECT candidate_id 
  FROM public.candidate_responses 
  WHERE status = 'recommended'
);
