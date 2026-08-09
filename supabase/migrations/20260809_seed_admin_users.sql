-- Admin Users Table & Initial Seed
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          BIGSERIAL PRIMARY KEY,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100) NOT NULL DEFAULT 'Admin Tri Tôn',
  role        VARCHAR(50)  NOT NULL DEFAULT 'SUPER_ADMIN',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- RLS Settings
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Seed Admin User Account
INSERT INTO public.admin_users (email, password, full_name, role)
VALUES ('rochthi59@gmail.com', 'Admin123@', 'Roch Thi (Super Admin)', 'SUPER_ADMIN')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, role = 'SUPER_ADMIN', is_active = TRUE;
