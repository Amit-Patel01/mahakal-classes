import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes here require ADMIN role
router.use(authenticate, authorizeRoles(Role.ADMIN));

router.get('/stats', AdminController.getDashboardStats);
router.get('/students', AdminController.getStudents);
router.get('/teachers', AdminController.getTeachers);
router.post('/teachers', AdminController.createTeacher);
router.delete('/teachers/:id', AdminController.deleteTeacher);
router.patch('/users/:id/status', AdminController.toggleUserStatus);

export default router;
