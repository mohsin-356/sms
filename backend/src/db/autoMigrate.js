import { query } from '../config/db.js';

export async function ensureStudentExtendedColumns() {
  // Normalize column names and ensure JSONB columns exist
  await query(`
    DO $$
    BEGIN
      -- Rename common misnamed columns to expected snake_case
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='rollnumber') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN rollnumber TO roll_number';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='rfidtag') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN rfidtag TO rfid_tag';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='feestatus') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN feestatus TO fee_status';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='busnumber') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN busnumber TO bus_number';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='busassigned') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN busassigned TO bus_assigned';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parentname') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN parentname TO parent_name';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parentphone') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN parentphone TO parent_phone';
      END IF;
      -- Some schemas might have "date" or "admissiondate" instead of admission_date
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admissiondate')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_date') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN admissiondate TO admission_date';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='date')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_date') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN date TO admission_date';
      END IF;
    END $$;

    ALTER TABLE students
      ADD COLUMN IF NOT EXISTS personal JSONB,
      ADD COLUMN IF NOT EXISTS academic JSONB,
      ADD COLUMN IF NOT EXISTS parent JSONB,
      ADD COLUMN IF NOT EXISTS transport JSONB,
      ADD COLUMN IF NOT EXISTS fee JSONB;

    -- Ensure JSONB columns are not null and have '{}' default
    UPDATE students SET personal='{}'::jsonb WHERE personal IS NULL;
    UPDATE students SET academic='{}'::jsonb WHERE academic IS NULL;
    UPDATE students SET parent='{}'::jsonb WHERE parent IS NULL;
    UPDATE students SET transport='{}'::jsonb WHERE transport IS NULL;
    UPDATE students SET fee='{}'::jsonb WHERE fee IS NULL;

    ALTER TABLE students
      ALTER COLUMN personal SET DEFAULT '{}'::jsonb,
      ALTER COLUMN academic SET DEFAULT '{}'::jsonb,
      ALTER COLUMN parent SET DEFAULT '{}'::jsonb,
      ALTER COLUMN transport SET DEFAULT '{}'::jsonb,
      ALTER COLUMN fee SET DEFAULT '{}'::jsonb;

    ALTER TABLE students
      ALTER COLUMN personal SET NOT NULL,
      ALTER COLUMN academic SET NOT NULL,
      ALTER COLUMN parent SET NOT NULL,
      ALTER COLUMN transport SET NOT NULL,
      ALTER COLUMN fee SET NOT NULL;
  `);
}

export async function ensureFinanceConstraints() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='fee_invoices' AND constraint_type='CHECK' AND constraint_name='fee_invoices_status_check'
      ) THEN
        EXECUTE 'ALTER TABLE fee_invoices DROP CONSTRAINT fee_invoices_status_check';
      END IF;
      EXECUTE 'ALTER TABLE fee_invoices ADD CONSTRAINT fee_invoices_status_check CHECK (status IN (''pending'',''in_progress'',''paid'',''overdue''))';
    END $$;
  `);
}
