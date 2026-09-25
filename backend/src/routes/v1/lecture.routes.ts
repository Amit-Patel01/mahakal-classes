import { Router } from 'express';
import { LectureController } from '../../controllers/lecture.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/course/:courseId', authenticate, LectureController.getLecturesByCourse);
router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  upload.single('videoFile'),
  LectureController.createLecture
);
router.post('/:lectureId/progress', authenticate, LectureController.updateProgress);

export default router;
