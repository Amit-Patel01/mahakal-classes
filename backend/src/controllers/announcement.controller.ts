import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { ObjectId } from 'mongodb';

export class AnnouncementController {
  static async createAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const publishedById = req.user?.userId;
      const { title, content, targetRole, courseId, isPinned } = req.body;

      if (!publishedById || !title || !content) {
        res.status(400).json({ success: false, message: 'Title and content are required.' });
        return;
      }

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc = {
        _id: new ObjectId(),
        title,
        content,
        targetRole: targetRole || null,
        courseId: courseId && ObjectId.isValid(courseId) ? new ObjectId(courseId) : null,
        publishedById: new ObjectId(publishedById),
        isPinned: Boolean(isPinned),
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('announcements').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        data: { ...doc, id: doc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Create Announcement Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create announcement' });
    }
  }

  static async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.query;
      const userRole = req.user?.role;

      // Read-only — safe with Prisma on standalone MongoDB
      const announcements = await prisma.announcement.findMany({
        where: {
          ...(courseId && { courseId: String(courseId) }),
          ...(userRole && {
            OR: [{ targetRole: null }, { targetRole: userRole }],
          }),
        },
        include: {
          publishedBy: { select: { name: true, role: true } },
          course: { select: { title: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      });

      res.status(200).json({ success: true, data: announcements });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch announcements' });
    }
  }
}
