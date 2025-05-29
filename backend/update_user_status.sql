-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE public.users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- Set all admin users to 'approved' status
UPDATE public.users
SET status = 'approved'
WHERE role = 'admin' AND (status IS NULL OR status != 'approved');

-- Set giodelapiedra24@gmail.com to admin and approved
UPDATE public.users
SET role = 'admin', status = 'approved'
WHERE email = 'giodelapiedra24@gmail.com';

-- Make sure all other users are pending by default if not set
UPDATE public.users
SET status = 'pending'
WHERE status IS NULL AND role != 'admin';

-- Notify completion
DO $$
BEGIN
  RAISE NOTICE 'User status column added and updated successfully!';
  RAISE NOTICE 'All admin users set to approved status.';
  RAISE NOTICE 'Regular users set to pending status by default.';
END $$; 