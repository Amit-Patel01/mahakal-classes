import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { TestEvaluationService } from '../services/testEvaluation.service';
import { AttemptStatus, QuestionType } from '@prisma/client';
import { ObjectId } from 'mongodb';

export class TestController {
  static async createTest(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.user?.userId;
      const {
        courseId,
        subjectId,
        title,
        description,
        durationMinutes,
        totalMarks,
        passingMarks,
        negativeMarkingRate,
        startsAt,
        endsAt,
        instructions,
        isPublished,
      } = req.body;

      if (!teacherId || !courseId || !subjectId || !title) {
        res.status(400).json({ success: false, message: 'Missing required test parameters' });
        return;
      }

      if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId)) {
        res.status(400).json({ success: false, message: 'Invalid courseId or subjectId.' });
        return;
      }

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc = {
        _id: new ObjectId(),
        courseId: new ObjectId(courseId),
        subjectId: new ObjectId(subjectId),
        teacherId: new ObjectId(teacherId),
        title,
        description: description || '',
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        totalMarks: parseFloat(totalMarks) || 100.0,
        passingMarks: parseFloat(passingMarks) || 40.0,
        negativeMarkingRate: parseFloat(negativeMarkingRate) || 0.25,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        instructions:
          instructions ||
          'Read each question carefully. Negative marking applies for wrong answers. The test will auto-submit when the countdown ends.',
        isPublished: Boolean(isPublished),
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('tests').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Test created successfully',
        data: { ...doc, id: doc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Create Test Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create test' });
    }
  }

  static async addQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const {
        questionText,
        questionImageFileId,
        type,
        marks,
        negativeMarks,
        explanation,
        orderIndex,
        options, // Array: [{ optionText, isCorrect, optionImageFileId? }]
      } = req.body;

      if (!questionText || !options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Question text and at least 2 options are required.',
        });
        return;
      }

      if (!ObjectId.isValid(testId)) {
        res.status(400).json({ success: false, message: 'Invalid testId.' });
        return;
      }

      const questionType: QuestionType =
        type && Object.values(QuestionType).includes(type) ? type : QuestionType.SINGLE_CHOICE;

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();

      const questionId = new ObjectId();
      const questionDoc = {
        _id: questionId,
        testId: new ObjectId(testId),
        questionText,
        questionImageFileId: questionImageFileId || null,
        type: questionType,
        marks: parseFloat(marks) || 4.0,
        negativeMarks: parseFloat(negativeMarks) || 1.0,
        explanation: explanation || '',
        orderIndex: parseInt(orderIndex, 10) || 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('questions').insertOne(questionDoc);

      // Insert all options
      const createdOptions = [];
      if (Array.isArray(options)) {
        for (let idx = 0; idx < options.length; idx++) {
          const opt = options[idx];
          const optDoc = {
            _id: new ObjectId(),
            questionId: questionId,
            optionText: opt.optionText || opt.text || '',
            optionImageFileId: opt.optionImageFileId || null,
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: idx,
            createdAt: now,
            updatedAt: now,
          };
          await db.collection('question_options').insertOne(optDoc);
          createdOptions.push({ ...optDoc, id: optDoc._id.toString() });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Question added successfully',
        data: { ...questionDoc, id: questionDoc._id.toString(), options: createdOptions },
      });
    } catch (error: any) {
      console.error('[Add Question Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to add question' });
    }
  }

  static async getAvailableTests(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;
      const { courseId } = req.query;

      // Read-only — safe with Prisma on standalone MongoDB
      const tests = await prisma.test.findMany({
        where: {
          isPublished: true,
          ...(courseId && { courseId: String(courseId) }),
        },
        include: {
          course: { select: { title: true, code: true } },
          subject: { select: { name: true, code: true } },
          _count: {
            select: { questions: true },
          },
          ...(studentId && {
            attempts: {
              where: { studentId },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = tests.map((t) => ({
        ...t,
        totalQuestions: t._count.questions,
        lastAttempt: t.attempts && t.attempts.length > 0 ? t.attempts[0] : null,
      }));

      res.status(200).json({ success: true, data: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching tests' });
    }
  }

  static async getTestForTaking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const test = await prisma.test.findUnique({
        where: { id },
        include: {
          course: { select: { title: true } },
          subject: { select: { name: true } },
          questions: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              questionText: true,
              questionImageFileId: true,
              type: true,
              marks: true,
              negativeMarks: true,
              orderIndex: true,
              // OMIT explanation and isCorrect to prevent student cheating
              options: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  optionText: true,
                  optionImageFileId: true,
                  orderIndex: true,
                },
              },
            },
          },
        },
      });

      if (!test) {
        res.status(404).json({ success: false, message: 'Test not found' });
        return;
      }

      res.status(200).json({ success: true, data: test });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error loading test' });
    }
  }

  static async startAttempt(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;
      const { testId } = req.params;

      if (!studentId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!ObjectId.isValid(testId)) {
        res.status(400).json({ success: false, message: 'Invalid testId.' });
        return;
      }

      const db = getNativeDb();

      // Check if active in-progress attempt already exists
      const existing = await db.collection('test_attempts').findOne({
        testId: new ObjectId(testId),
        studentId: new ObjectId(studentId),
        status: AttemptStatus.IN_PROGRESS,
      });

      if (existing) {
        res.status(200).json({
          success: true,
          message: 'Resuming existing test attempt',
          data: { ...existing, id: existing._id.toString() },
        });
        return;
      }

      // Create new attempt using native MongoDB
      const now = new Date();
      const attemptDoc = {
        _id: new ObjectId(),
        testId: new ObjectId(testId),
        studentId: new ObjectId(studentId),
        startedAt: now,
        status: AttemptStatus.IN_PROGRESS,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('test_attempts').insertOne(attemptDoc);

      res.status(200).json({
        success: true,
        message: 'Test attempt started',
        data: { ...attemptDoc, id: attemptDoc._id.toString() },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to start attempt' });
    }
  }

  static async submitAttempt(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;
      const { attemptId } = req.params;
      const { answers } = req.body; // Array: [{ questionId, selectedOptionIds, isMarkedForReview }]

      if (!studentId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await TestEvaluationService.evaluateAttempt(
        attemptId,
        studentId,
        answers || []
      );

      res.status(200).json({
        success: true,
        message: 'Test submitted and evaluated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('[Submit Attempt Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Submission failed' });
    }
  }
}
