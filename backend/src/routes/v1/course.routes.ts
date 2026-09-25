import { Router } from 'express';
import { CourseController } from '../../controllers/course.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// Authenticated Student
router.post('/enroll', authenticate, CourseController.enrollStudent);

// Teacher / Admin
router.post('/', authenticate, authorizeRoles(Role.ADMIN, Role.TEACHER), CourseController.createCourse);
router.put('/:id', authenticate, authorizeRoles(Role.ADMIN, Role.TEACHER), CourseController.updateCourse);
router.post('/subjects', authenticate, authorizeRoles(Role.ADMIN, Role.TEACHER), CourseController.createSubject);
router.post('/chapters', authenticate, authorizeRoles(Role.ADMIN, Role.TEACHER), CourseController.createChapter);

// Admin only
router.delete('/:id', authenticate, authorizeRoles(Role.ADMIN), CourseController.deleteCourse);

export default router;
