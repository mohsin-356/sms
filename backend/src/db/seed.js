import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';
import { loadEnv } from '../config/env.js';

loadEnv();

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create demo users if not exists
    const usersToSeed = [
      { email: 'admin@mindspire.com', role: 'admin', name: 'Admin User', password: 'password123' },
      { email: 'teacher@mindspire.com', role: 'teacher', name: 'Teacher Ali', password: 'password123' },
      { email: 'student@mindspire.com', role: 'student', name: 'Student Ahmed', password: 'password123' },
      { email: 'driver@mindspire.com', role: 'driver', name: 'Driver Umar', password: 'password123' },
    ];
    for (const u of usersToSeed) {
      const { rows: existing } = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (!existing.length) {
        const hash = await bcrypt.hash(u.password, 10);
        await client.query('INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4)', [u.email, hash, u.role, u.name]);
        console.log('Seeded user:', u.email, 'password:', u.password);
      } else {
        console.log('User already exists:', u.email);
      }
    }

    // Seed a demo student only if not present (by email OR roll number)
    const { rows: existsStudent } = await client.query(
      'SELECT id FROM students WHERE email = $1 OR roll_number = $2 LIMIT 1',
      ['student@mindspire.com', 'STD001']
    );
    if (!existsStudent.length) {
      await client.query(
        `INSERT INTO students (name, email, roll_number, class, section, rfid_tag, attendance, fee_status, bus_number, bus_assigned, parent_name, parent_phone, status)
         VALUES ('Student Ahmed','student@mindspire.com','STD001','10','A','RFID-001',95.5,'paid','101',true,'Khan Sahab','+92 300 1234567','active')`
      );
      console.log('Seeded demo student: student@mindspire.com');
    } else {
      console.log('Demo student already exists, skipping.');
    }

    const defaultSubjects = [
      { name: 'Mathematics', code: 'MATH', department: 'Science & Mathematics' },
      { name: 'Physics', code: 'PHYS', department: 'Science & Mathematics' },
      { name: 'Chemistry', code: 'CHEM', department: 'Science & Mathematics' },
      { name: 'Biology', code: 'BIO', department: 'Science & Mathematics' },
      { name: 'English', code: 'ENG', department: 'Languages' },
      { name: 'History', code: 'HIST', department: 'Humanities' },
      { name: 'Geography', code: 'GEO', department: 'Humanities' },
      { name: 'Computer Science', code: 'CS', department: 'Technology' },
    ];

    for (const subject of defaultSubjects) {
      await client.query(
        `INSERT INTO subjects (name, code, department)
         VALUES ($1,$2,$3)
         ON CONFLICT (name)
         DO UPDATE SET code = EXCLUDED.code, department = EXCLUDED.department, updated_at = NOW()`,
        [subject.name, subject.code, subject.department]
      );
    }

    const { rows: teacherRows } = await client.query('SELECT id FROM teachers ORDER BY id LIMIT 10');
    if (!teacherRows.length) {
      console.log('No teachers found; skipping class section seed.');
    } else {
      const defaultClasses = [
        { className: 'Class 1', section: 'A', capacity: 30, enrolled: 28, room: 'A101' },
        { className: 'Class 1', section: 'B', capacity: 30, enrolled: 26, room: 'A102' },
        { className: 'Class 2', section: 'A', capacity: 32, enrolled: 30, room: 'B201' },
        { className: 'Class 3', section: 'A', capacity: 28, enrolled: 24, room: 'C301' },
      ];
      const academicYear = '2024-2025';
      for (let idx = 0; idx < defaultClasses.length; idx += 1) {
        const entry = defaultClasses[idx];
        const teacherId = teacherRows[idx % teacherRows.length]?.id || null;
        await client.query(
          `INSERT INTO class_sections (class_name, section, academic_year, class_teacher_id, capacity, enrolled_students, status, room)
           VALUES ($1,$2,$3,$4,$5,$6,'active',$7)
           ON CONFLICT (class_name, section, academic_year)
           DO UPDATE SET
             class_teacher_id = EXCLUDED.class_teacher_id,
             capacity = EXCLUDED.capacity,
             enrolled_students = LEAST(EXCLUDED.enrolled_students, EXCLUDED.capacity),
             status = EXCLUDED.status,
             room = EXCLUDED.room,
             updated_at = NOW()` ,
          [entry.className, entry.section, academicYear, teacherId, entry.capacity, entry.enrolled, entry.room]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
