-- Fix RLS policies for verification_results - require at least minimal validation
DROP POLICY IF EXISTS "Anyone can insert verification results" ON public.verification_results;
CREATE POLICY "Insert verification results"
  ON public.verification_results FOR INSERT
  WITH CHECK (
    -- Either anonymous (user_id is null) or authenticated user inserting their own
    (user_id IS NULL) OR (auth.uid() = user_id)
  );

-- Fix RLS policies for reports - require at least minimal validation
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.reports;
CREATE POLICY "Insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    -- Either anonymous (user_id is null) or authenticated user inserting their own
    (user_id IS NULL) OR (auth.uid() = user_id)
  );