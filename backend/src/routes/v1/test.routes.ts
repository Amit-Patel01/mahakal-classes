import { Router } from 'express';
import { TestController } from '../../controllers/test.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Student routes
router.get('/', authenticate, TestController.getAvailableTests);
router.get('/:id/take', authenticate, TestController.getTestForTaking);
router.post('/:testId/start', authenticate, TestController.startAttempt);
router.post('/attempts/:attemptId/submit', authenticate, TestController.submitAttempt);

// Teacher & Admin routes
router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  TestController.createTest
);
router.post(
  '/:testId/questions',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  TestController.addQuestion
);

export default router;
