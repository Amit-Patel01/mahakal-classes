import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { GridFSService } from '../services/gridfs.service';
import { ObjectId } from 'mongodb';

export class LectureController {
  static async createLecture(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.user?.userId;
      const file = req.file; // Optional video file uploaded to GridFS
      const {
        courseId,
        subjectId,
        chapterId,
        title,
        description,
        videoUrl,
        durationMinutes,
        orderIndex,
        thumbnailFileId,
      } = req.body;

      if (!teacherId || !courseId || !subjectId || !title) {
        res.status(400).json({ success: false, message: 'Missing required fields.' });
        return;
      }

      if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId)) {
        res.status(400).json({ success: false, message: 'Invalid courseId or subjectId format.' });
        return;
      }

      let videoFileId: string | null = null;

      // If video file was uploaded directly, pipe to MongoDB GridFS
      if (file) {
        const gridResult = await GridFSService.uploadBuffer(
          file.buffer,
          file.originalname,
          file.mimetype,
          { courseId, subjectId, teacherId, title }
        );
        videoFileId = gridResult.fileId;
      }

      const db = getNativeDb();
      const now = new Date();
      const validChapterId = chapterId && ObjectId.isValid(chapterId) ? new ObjectId(chapterId) : null;
      const validTeacherId = ObjectId.isValid(teacherId) ? new ObjectId(teacherId) : null;

      const lectureDoc: any = {
        _id: new ObjectId(),
        courseId: new ObjectId(courseId),
        subjectId: new ObjectId(subjectId),
        chapterId: validChapterId,
        teacherId: validTeacherId,
        title,
        description: description || '',
        videoFileId: videoFileId || null,
        videoUrl: videoUrl || null,
        durationMinutes: parseInt(durationMinutes, 10) || 0,
        thumbnailFileId: thumbnailFileId || null,
        orderIndex: parseInt(orderIndex, 10) || 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('lectures').insertOne(lectureDoc);

      res.status(201).json({
        success: true,
        message: 'Lecture created successfully',
        data: { ...lectureDoc, id: lectureDoc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Create Lecture Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Creation failed' });
    }
  }

  static async getLecturesByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { subjectId, chapterId } = req.query;
      const studentId = req.user?.userId;

      const lectures = await prisma.lecture.findMany({
        where: {
          courseId,
          ...(subjectId && { subjectId: String(subjectId) }),
          ...(chapterId && { chapterId: String(chapterId) }),
        },
        include: {
          subject: { select: { name: true, code: true } },
          chapter: { select: { title: true, orderIndex: true } },
          teacher: { select: { name: true } },
          ...(studentId && {
            progressList: {
              where: { studentId },
              take: 1,
            },
          }),
        },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      });

      const formatted = lectures.map((lec) => ({
        ...lec,
        progress: lec.progressList && lec.progressList.length > 0 ? lec.progressList[0] : null,
      }));

      res.status(200).json({ success: true, data: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching lectures' });
    }
  }

  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;
      const { lectureId } = req.params;
      const { watchedSeconds, isCompleted } = req.body;

      if (!studentId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Use native MongoDB upsert to avoid Prisma replica set error
      const db = getNativeDb();
      const filter = { studentId: new ObjectId(studentId), lectureId: new ObjectId(lectureId) };
      const now = new Date();
      await db.collection('lecture_progress').updateOne(
        filter,
        {
          $set: {
            watchedSeconds: parseInt(watchedSeconds, 10) || 0,
            isCompleted: Boolean(isCompleted),
            lastWatchedAt: now,
            updatedAt: now,
          },
          $setOnInsert: {
            studentId: new ObjectId(studentId),
            lectureId: new ObjectId(lectureId),
            createdAt: now,
          },
        },
        { upsert: true }
      );

      res.status(200).json({ success: true, message: 'Progress saved' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Progress update failed' });
    }
  }
}
