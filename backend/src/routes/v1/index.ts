import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import materialRoutes from './material.routes';
import lectureRoutes from './lecture.routes';
import liveClassRoutes from './liveClass.routes';
import testRoutes from './test.routes';
import resultRoutes from './result.routes';
import galleryRoutes from './gallery.routes';
import fileRoutes from './file.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/materials', materialRoutes);
router.use('/lectures', lectureRoutes);
router.use('/live-classes', liveClassRoutes);
router.use('/tests', testRoutes);
router.use('/results', resultRoutes);
router.use('/gallery', galleryRoutes);
router.use('/files', fileRoutes); // MongoDB GridFS File Streamer
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

// API Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Mahakal Classes Backend REST API (MongoDB + GridFS)',
    version: '1.0.0',
  });
});

export default router;
