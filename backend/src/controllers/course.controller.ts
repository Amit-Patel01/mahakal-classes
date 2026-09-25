import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { ObjectId } from 'mongodb';

export class CourseController {
  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      const isAuthenticated = !!(req as any).user;

      const courses = await prisma.course.findMany({
        where: {
          // Authenticated users (teachers/admins) see ALL courses; public sees only published
          ...(isAuthenticated ? {} : { isPublished: true }),
          ...(search && {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
              { code: { contains: String(search), mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          subjects: {
            include: {
              chapters: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              materials: true,
              lectures: true,
              tests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: courses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch courses' });
    }
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          subjects: {
            include: {
              chapters: true,
              _count: {
                select: {
                  materials: true,
                  lectures: true,
                  tests: true,
                },
              },
            },
          },
          materials: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          lectures: {
            take: 5,
            orderBy: { orderIndex: 'asc' },
          },
          tests: {
            where: { isPublished: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          liveClasses: {
            where: { status: 'LIVE' },
            take: 1,
          },
        },
      });

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      res.status(200).json({ success: true, data: course });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching course' });
    }
  }

  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const { title, code, description, duration, price, thumbnailFileId } = req.body;

      if (!title || !code || !description) {
        res.status(400).json({ success: false, message: 'Title, code, and description are required.' });
        return;
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();

      // Check if slug or code already exists
      const existing = await db.collection('courses').findOne({
        $or: [{ slug }, { code }],
      });
      if (existing) {
        res.status(409).json({
          success: false,
          message: `A course with the code "${code}" already exists. Please use a unique batch code.`,
        });
        return;
      }

      const doc = {
        _id: new ObjectId(),
        title,
        slug,
        code,
        description,
        duration: duration || '1 Year',
        price: parseFloat(price) || 0.0,
        thumbnailFileId: thumbnailFileId || null,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('courses').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Course batch launched successfully!',
        data: { ...doc, id: doc._id.toString() },
      });
    } catch (error: any) {
      console.error('[createCourse Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Course creation failed' });
    }
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await prisma.course.update({
        where: { id },
        data,
      });

      res.status(200).json({ success: true, message: 'Course updated', data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.course.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Delete failed' });
    }
  }

  static async createSubject(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, name, code, description, icon } = req.body;

      if (!courseId || !name || !code) {
        res.status(400).json({ success: false, message: 'courseId, name aur code required hain' });
        return;
      }

      // Validate courseId is a valid ObjectId
      if (!ObjectId.isValid(courseId)) {
        res.status(400).json({ success: false, message: 'Invalid courseId format' });
        return;
      }

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc = {
        _id: new ObjectId(),
        courseId: new ObjectId(courseId),
        name,
        code,
        description: description || null,
        icon: icon || null,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('subjects').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: { ...doc, id: doc._id.toString(), courseId: courseId },
      });
    } catch (error: any) {
      console.error('[createSubject Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create subject' });
    }
  }

  static async createChapter(req: Request, res: Response): Promise<void> {
    try {
      const { subjectId, title, orderIndex, description } = req.body;

      if (!subjectId || !title) {
        res.status(400).json({ success: false, message: 'subjectId aur title required hain' });
        return;
      }

      if (!ObjectId.isValid(subjectId)) {
        res.status(400).json({ success: false, message: 'Invalid subjectId format' });
        return;
      }

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc = {
        _id: new ObjectId(),
        subjectId: new ObjectId(subjectId),
        title,
        orderIndex: parseInt(orderIndex, 10) || 0,
        description: description || null,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('chapters').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        data: { ...doc, id: doc._id.toString(), subjectId: subjectId },
      });
    } catch (error: any) {
      console.error('[createChapter Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create chapter' });
    }
  }

  static async enrollStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;
      const { courseId } = req.body;

      if (!studentId || !courseId) {
        res.status(400).json({ success: false, message: 'Missing student or course ID' });
        return;
      }

      if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
        res.status(400).json({ success: false, message: 'Invalid studentId or courseId format' });
        return;
      }

      const db = getNativeDb();
      const now = new Date();

      await db.collection('enrollments').updateOne(
        {
          studentId: new ObjectId(studentId),
          courseId: new ObjectId(courseId),
        },
        {
          $set: {
            status: 'ACTIVE',
          },
          $setOnInsert: {
            _id: new ObjectId(),
            studentId: new ObjectId(studentId),
            courseId: new ObjectId(courseId),
            enrolledAt: now,
          },
        },
        { upsert: true }
      );

      const enrollment = await db.collection('enrollments').findOne({
        studentId: new ObjectId(studentId),
        courseId: new ObjectId(courseId),
      });

      res.status(200).json({
        success: true,
        message: 'Enrolled in course successfully',
        data: enrollment ? { ...enrollment, id: enrollment._id.toString() } : null,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Enrollment failed' });
    }
  }
}
