import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { LiveStatus } from '@prisma/client';
import { ObjectId } from 'mongodb';

export class LiveClassController {
  static async createLiveClass(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.user?.userId;
      const {
        courseId,
        subjectId,
        title,
        description,
        scheduledDate,
        startTime,
        endTime,
        streamUrl,
        streamPlatform,
        thumbnailFileId,
      } = req.body;

      if (!teacherId || !courseId || !subjectId || !title || !streamUrl) {
        res.status(400).json({ success: false, message: 'Missing required live class fields' });
        return;
      }

      if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId)) {
        res.status(400).json({ success: false, message: 'Invalid courseId or subjectId.' });
        return;
      }

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();

      const liveClassDoc = {
        _id: new ObjectId(),
        courseId: new ObjectId(courseId),
        subjectId: new ObjectId(subjectId),
        teacherId: new ObjectId(teacherId),
        title,
        description: description || '',
        scheduledDate: new Date(scheduledDate || Date.now()),
        startTime: startTime || '10:00 AM',
        endTime: endTime || '11:30 AM',
        streamUrl,
        streamPlatform: streamPlatform || 'YouTube Live',
        thumbnailFileId: thumbnailFileId || null,
        status: LiveStatus.UPCOMING,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('live_classes').insertOne(liveClassDoc);

      // Broadcast announcement using native MongoDB
      const announcementDoc = {
        _id: new ObjectId(),
        title: `🔴 Live Class Scheduled: ${title}`,
        content: `New live lecture scheduled on ${new Date(scheduledDate).toLocaleDateString()} at ${startTime}. Topic: ${title}`,
        courseId: new ObjectId(courseId),
        publishedById: new ObjectId(teacherId),
        targetRole: null,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection('announcements').insertOne(announcementDoc);

      res.status(201).json({
        success: true,
        message: 'Live lecture scheduled successfully',
        data: { ...liveClassDoc, id: liveClassDoc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Create Live Class Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Creation failed' });
    }
  }

  static async getLiveClasses(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, status } = req.query;

      // Read-only — safe with Prisma on standalone MongoDB
      const liveClasses = await prisma.liveClass.findMany({
        where: {
          ...(courseId && { courseId: String(courseId) }),
          ...(status && { status: status as LiveStatus }),
        },
        include: {
          course: { select: { title: true, code: true } },
          subject: { select: { name: true, code: true } },
          teacher: { select: { name: true, email: true } },
        },
        orderBy: [{ status: 'asc' }, { scheduledDate: 'desc' }],
      });

      res.status(200).json({ success: true, data: liveClasses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch live classes' });
    }
  }

  static async getActiveLiveNow(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.query;

      const activeClass = await prisma.liveClass.findFirst({
        where: {
          status: LiveStatus.LIVE,
          ...(courseId && { courseId: String(courseId) }),
        },
        include: {
          course: { select: { title: true, code: true } },
          subject: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      });

      res.status(200).json({ success: true, data: activeClass });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to check active class' });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(LiveStatus).includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid live class status.' });
        return;
      }

      if (!ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid live class ID.' });
        return;
      }

      // Native MongoDB update to avoid transaction error
      const db = getNativeDb();
      await db.collection('live_classes').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

      res.status(200).json({
        success: true,
        message: `Live class status updated to ${status}`,
        data: { id, status },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Status update failed' });
    }
  }
}
