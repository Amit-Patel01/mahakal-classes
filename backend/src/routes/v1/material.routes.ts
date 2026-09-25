import { Router } from 'express';
import { MaterialController } from '../../controllers/material.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Protected material discovery - Requires login (STUDENT, TEACHER, ADMIN)
router.get('/', authenticate, MaterialController.getMaterials);
router.get('/:id', authenticate, MaterialController.getMaterialById);

// Teacher / Admin upload directly into MongoDB GridFS
router.post(
  '/upload',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  upload.single('file'),
  MaterialController.uploadMaterial
);

// Admin / Teacher delete
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.TEACHER),
  MaterialController.deleteMaterial
);

export default router;
