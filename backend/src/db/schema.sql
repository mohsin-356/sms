-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','teacher','student','driver')),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  roll_number TEXT,
  class TEXT,
  section TEXT,
  rfid_tag TEXT,
  attendance NUMERIC(5,2) DEFAULT 0,
  fee_status TEXT DEFAULT 'paid' CHECK (fee_status IN ('paid','pending','overdue')),
  bus_number TEXT,
  bus_assigned BOOLEAN DEFAULT FALSE,
  parent_name TEXT,
  parent_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  admission_date DATE DEFAULT CURRENT_DATE,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  qualification TEXT,
  gender TEXT,
  dob DATE,
  blood_group TEXT,
  religion TEXT,
  national_id TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  employment_type TEXT NOT NULL DEFAULT 'fullTime',
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id TEXT NOT NULL UNIQUE,
  department TEXT,
  designation TEXT,
  experience_years NUMERIC(4,1),
  specialization TEXT,
  subject TEXT,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  employment_status TEXT NOT NULL DEFAULT 'active',
  status TEXT NOT NULL DEFAULT 'active',
  probation_end_date DATE,
  contract_end_date DATE,
  work_hours_per_week NUMERIC(5,2),
  base_salary NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  deductions NUMERIC(12,2) DEFAULT 0,
  salary NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  pay_frequency TEXT DEFAULT 'monthly',
  payment_method TEXT DEFAULT 'bank',
  bank_name TEXT,
  account_number TEXT,
  iban TEXT,
  avatar TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Backfill columns for existing deployments
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS emergency_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_relation TEXT,
  ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'fullTime',
  ADD COLUMN IF NOT EXISTS joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS employee_id TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS experience_years NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS probation_end_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS work_hours_per_week NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowances NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deductions NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR',
  ADD COLUMN IF NOT EXISTS pay_frequency TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE teachers SET employee_id = CONCAT('T-', id) WHERE employee_id IS NULL;

ALTER TABLE teachers
  ALTER COLUMN employee_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teachers_employee_id_key'
  ) THEN
    ALTER TABLE teachers ADD CONSTRAINT teachers_employee_id_key UNIQUE (employee_id);
  END IF;
END $$;

UPDATE teachers SET subjects = '[]'::jsonb WHERE subjects IS NULL;
UPDATE teachers SET classes = '[]'::jsonb WHERE classes IS NULL;

UPDATE teachers SET status = 'active' WHERE status IS NULL;

ALTER TABLE teachers
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE teachers
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_status_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_status_check CHECK (status IN ('active','inactive','on_leave','resigned'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_employment_status_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_employment_status_check CHECK (employment_status IN ('active','inactive','on_leave','resigned'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_employment_type_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_employment_type_check CHECK (employment_type IN ('fullTime','partTime'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_pay_frequency_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_pay_frequency_check CHECK (pay_frequency IN ('monthly','biweekly','weekly'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_payment_method_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_payment_method_check CHECK (payment_method IN ('bank','cash','cheque'));

-- Class sections (grade/section master)
CREATE TABLE IF NOT EXISTS class_sections (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  section TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '',
  class_teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
  enrolled_students INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_students >= 0),
  room TEXT,
  medium TEXT,
  shift TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (class_name, section, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_class_sections_teacher ON class_sections (class_teacher_id);

-- Teacher schedules
CREATE TABLE IF NOT EXISTS teacher_schedules (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class TEXT,
  section TEXT,
  subject TEXT
);

ALTER TABLE teacher_schedules
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS time_slot_index INTEGER,
  ADD COLUMN IF NOT EXISTS time_slot_label TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_schedule_unique_slot'
  ) THEN
    ALTER TABLE teacher_schedules
      ADD CONSTRAINT teacher_schedule_unique_slot UNIQUE (teacher_id, day_of_week, start_time);
  END IF;
END $$;

-- Academic subjects master
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  department TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Teacher <> subject allocation
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  academic_year TEXT NOT NULL DEFAULT '',
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE teacher_subject_assignments
  ALTER COLUMN academic_year SET DEFAULT '';

UPDATE teacher_subject_assignments SET academic_year = '' WHERE academic_year IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_subject_assignments_unique'
  ) THEN
    ALTER TABLE teacher_subject_assignments
      ADD CONSTRAINT teacher_subject_assignments_unique UNIQUE (teacher_id, subject_id, academic_year);
  END IF;
END $$;

-- Teacher attendance records
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  check_in_time TIME,
  check_out_time TIME,
  remarks TEXT,
  recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_teacher_attendance_date ON teacher_attendance (attendance_date);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher ON teacher_attendance (teacher_id);

-- Teacher payroll records
CREATE TABLE IF NOT EXISTS teacher_payrolls (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','cancelled')),
  payment_method TEXT,
  transaction_reference TEXT,
  paid_on TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, period_month)
);

CREATE INDEX IF NOT EXISTS idx_teacher_payrolls_period ON teacher_payrolls (period_month);
CREATE INDEX IF NOT EXISTS idx_teacher_payrolls_status ON teacher_payrolls (status);

-- Teacher performance reviews
CREATE TABLE IF NOT EXISTS teacher_performance_reviews (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,
  period_label TEXT,
  period_start DATE,
  period_end DATE,
  overall_score NUMERIC(5,2),
  student_feedback_score NUMERIC(5,2),
  attendance_score NUMERIC(5,2),
  class_management_score NUMERIC(5,2),
  exam_results_score NUMERIC(5,2),
  status TEXT,
  improvement NUMERIC(5,2),
  remarks TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_performance_period ON teacher_performance_reviews (period_type, period_label);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  class TEXT,
  section TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_name ON students (name);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students (roll_number);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (name);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers (department);
CREATE INDEX IF NOT EXISTS idx_assignments_due ON assignments (due_date);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  remarks TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Transport: Buses and Routes
CREATE TABLE IF NOT EXISTS buses (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  driver_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','maintenance','inactive'))
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  sequence INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bus_assignments (
  id SERIAL PRIMARY KEY,
  bus_id INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(bus_id)
);

CREATE TABLE IF NOT EXISTS student_transport (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  bus_id INTEGER REFERENCES buses(id) ON DELETE SET NULL,
  pickup_stop_id INTEGER REFERENCES route_stops(id) ON DELETE SET NULL,
  drop_stop_id INTEGER REFERENCES route_stops(id) ON DELETE SET NULL
);

-- Finance: Invoices and Payments
CREATE TABLE IF NOT EXISTS fee_invoices (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  due_date DATE,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT,
  paid_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Communication: Announcements and Alerts
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT DEFAULT 'all',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Academics: Exams & Results
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  exam_date DATE,
  class TEXT,
  section TEXT
);

CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT,
  marks NUMERIC(5,2),
  grade TEXT,
  UNIQUE(exam_id, student_id, subject)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records (student_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_status ON fee_invoices (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);
