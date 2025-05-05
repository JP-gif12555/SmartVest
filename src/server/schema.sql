-- Drop tables in correct order (handling foreign key constraints)
DROP TABLE IF EXISTS public.vesting_schedules;
DROP TABLE IF EXISTS public.otps;
DROP TABLE IF EXISTS public.users;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.otps;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON public.otps;
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.vesting_schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON public.vesting_schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON public.vesting_schedules;
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."otps";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."otps";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."otps";

-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create otps table
CREATE TABLE public.otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vesting_schedules table
CREATE TABLE public.vesting_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    token_address TEXT NOT NULL,
    beneficiary TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    total_amount DECIMAL NOT NULL,
    released_amount DECIMAL DEFAULT 0,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vesting_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for otps table
CREATE POLICY "Enable all access for service role" ON public.otps
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for vesting_schedules table
CREATE POLICY "Users can view their own schedules" ON public.vesting_schedules
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON public.vesting_schedules
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON public.vesting_schedules
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_vesting_schedules_user_id ON public.vesting_schedules(user_id);
CREATE INDEX idx_otps_email ON public.otps(email);
CREATE INDEX idx_users_email ON public.users(email);

-- Create new policies for service role
CREATE POLICY "Enable all access for service role" ON "public"."otps"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS
ALTER TABLE "public"."otps" ENABLE ROW LEVEL SECURITY;

-- Create otps table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."otps" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "otp" text NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- Create vesting_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."vesting_schedules" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "token_address" text NOT NULL,
    "beneficiary" text NOT NULL,
    "total_amount" numeric NOT NULL,
    "released_amount" numeric DEFAULT 0 NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "duration" integer NOT NULL,
    "revoked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "vesting_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vesting_schedules_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL,
    "email" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Enable RLS on vesting_schedules
ALTER TABLE "public"."vesting_schedules" ENABLE ROW LEVEL SECURITY;

-- Create policy for vesting_schedules
CREATE POLICY "Users can view their own vesting schedules" ON "public"."vesting_schedules"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vesting schedules" ON "public"."vesting_schedules"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Enable RLS on users
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Create policy for users
CREATE POLICY "Users can view their own data" ON "public"."users"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON "public"."users"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 