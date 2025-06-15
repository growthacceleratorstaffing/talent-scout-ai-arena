
-- Update function: public.has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Update function: public.has_workable_role
CREATE OR REPLACE FUNCTION public.has_workable_role(_user_id uuid, _role workable_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.workable_users
    WHERE user_id = _user_id
      AND workable_role = _role
  )
$function$;

-- Update function: public.get_user_assigned_jobs
CREATE OR REPLACE FUNCTION public.get_user_assigned_jobs(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(assigned_jobs, '{}')
  FROM public.workable_users
  WHERE user_id = _user_id
$function$;

-- Update function: public.get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1 
      WHEN role = 'moderator' THEN 2 
      WHEN role = 'user' THEN 3 
    END 
  LIMIT 1
$function$;

-- Update function: public.make_first_user_admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if there are any admin users
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- If no admins exist and there's a user in profiles, make them admin
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::app_role
    FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
END;
$function$;

-- Update function: public.handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  -- Make the first user admin if no admin exists
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  ELSE
    -- Assign regular user role to subsequent users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
  END IF;
  
  RETURN new;
END;
$function$;

-- Update function: public.can_access_job
CREATE OR REPLACE FUNCTION public.can_access_job(_user_id uuid, _job_shortcode text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.workable_users 
        WHERE user_id = _user_id AND workable_role = 'admin'
      ) THEN TRUE
      WHEN _job_shortcode = ANY(
        SELECT unnest(assigned_jobs) 
        FROM public.workable_users 
        WHERE user_id = _user_id
      ) THEN TRUE
      ELSE FALSE
    END
$function$;

-- Update function: public.trigger_workable_sync
CREATE OR REPLACE FUNCTION public.trigger_workable_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert a sync trigger record that the edge function can pick up
  INSERT INTO integration_sync_logs (
    integration_type,
    sync_type,
    status,
    synced_data
  ) VALUES (
    'workable',
    'auto_sync_jobs_and_candidates',
    'pending',
    '{"trigger": "cron_job", "timestamp": "' || now() || '"}'::jsonb
  );
END;
$function$;
