import { Router } from 'express';
import { LiveClassController } from '../../controllers/liveClass.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, LiveClassController.getLiveClasses);
router.get('/active', authenticate, LiveClassController.getActiveLiveNow);
router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  LiveClassController.createLiveClass
);
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  LiveClassController.updateStatus
);

export default router;
