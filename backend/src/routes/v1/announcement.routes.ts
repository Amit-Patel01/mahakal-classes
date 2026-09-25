import { Router } from 'express';
import { AnnouncementController } from '../../controllers/announcement.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, AnnouncementController.getAnnouncements);
router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  AnnouncementController.createAnnouncement
);

export default router;
