import { Router } from 'express';
import { FileController } from '../../controllers/file.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// Stream file with HTTP 206 range request support (public/authenticated with token in query or header)
router.get('/stream/:fileId', FileController.streamFile);

// Direct download file
router.get('/:fileId', FileController.downloadFile);

// Get file metadata
router.get('/:fileId/info', FileController.getFileInfo);

// Authenticated upload to GridFS
router.post('/upload', authenticate, upload.single('file'), FileController.uploadFile);

export default router;
