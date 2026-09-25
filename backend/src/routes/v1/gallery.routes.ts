import { Router } from 'express';
import { GalleryController } from '../../controllers/gallery.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', GalleryController.getGallery);

router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN),
  upload.single('image'),
  GalleryController.uploadPhoto
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN),
  GalleryController.deletePhoto
);

export default router;
