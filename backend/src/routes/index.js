import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './students.routes.js';
import teacherRoutes from './teachers.routes.js';
import assignmentRoutes from './assignments.routes.js';
import attendanceRoutes from './attendance.routes.js';
import transportRoutes from './transport.routes.js';
import rfidRoutes from './rfid.routes.js';
import financeRoutes from './finance.routes.js';
import communicationRoutes from './communication.routes.js';
import reportsRoutes from './reports.routes.js';
import settingsRoutes from './settings.routes.js';
import notificationsRoutes from './notifications.routes.js';
import examsRoutes from './exams.routes.js';
import resultsRoutes from './results.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import classRoutes from './classes.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/transport', transportRoutes);
router.use('/rfid', rfidRoutes);
router.use('/finance', financeRoutes);
router.use('/communication', communicationRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/exams', examsRoutes);
router.use('/results', resultsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/classes', classRoutes);

export default router;
