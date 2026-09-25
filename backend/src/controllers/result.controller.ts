import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AttemptStatus } from '@prisma/client';

export class ResultController {
  static async getStudentResults(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;

      const attempts = await prisma.testAttempt.findMany({
        where: {
          studentId,
          status: AttemptStatus.SUBMITTED,
        },
        include: {
          test: {
            include: {
              course: { select: { title: true, code: true } },
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      res.status(200).json({ success: true, data: attempts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch results' });
    }
  }

  static async getResultDetails(req: Request, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;
      const studentId = req.user?.userId;
      const role = req.user?.role;

      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
          test: {
            include: {
              course: { select: { title: true } },
              subject: { select: { name: true } },
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
          answers: true,
          student: { select: { name: true, email: true, mobile: true } },
        },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: 'Result not found' });
        return;
      }

      // Allow only the student who attempted it or Teacher/Admin
      if (role === 'STUDENT' && attempt.studentId !== studentId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      res.status(200).json({ success: true, data: attempt });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching result' });
    }
  }

  static async getStudentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.userId;

      const attempts = await prisma.testAttempt.findMany({
        where: {
          studentId,
          status: AttemptStatus.SUBMITTED,
        },
        include: {
          test: {
            include: {
              subject: true,
            },
          },
        },
      });

      const totalAttempted = attempts.length;
      if (totalAttempted === 0) {
        res.status(200).json({
          success: true,
          data: {
            totalAttempted: 0,
            averagePercentage: 0,
            bestScore: 0,
            passedCount: 0,
            subjectStats: {},
          },
        });
        return;
      }

      const totalPercentage = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
      const averagePercentage = Math.round((totalPercentage / totalAttempted) * 10) / 10;
      const bestScore = Math.max(...attempts.map((a) => a.totalScore));
      const passedCount = attempts.filter((a) => a.isPassed).length;

      // Group by subject
      const subjectStats: Record<string, { totalScore: number; attempts: number; avgPercentage: number }> = {};

      attempts.forEach((a) => {
        const subj = a.test.subject.name;
        if (!subjectStats[subj]) {
          subjectStats[subj] = { totalScore: 0, attempts: 0, avgPercentage: 0 };
        }
        subjectStats[subj].attempts += 1;
        subjectStats[subj].avgPercentage += a.percentage;
      });

      Object.keys(subjectStats).forEach((key) => {
        subjectStats[key].avgPercentage =
          Math.round((subjectStats[key].avgPercentage / subjectStats[key].attempts) * 10) / 10;
      });

      res.status(200).json({
        success: true,
        data: {
          totalAttempted,
          averagePercentage,
          bestScore,
          passedCount,
          recentScores: attempts.slice(0, 5).map((a) => ({
            testTitle: a.test.title,
            score: a.totalScore,
            percentage: a.percentage,
            date: a.submittedAt,
          })),
          subjectStats,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Analytics failed' });
    }
  }

  static async getTestLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;

      const attempts = await prisma.testAttempt.findMany({
        where: {
          testId,
          status: AttemptStatus.SUBMITTED,
        },
        include: {
          student: { select: { id: true, name: true, avatarFileId: true } },
        },
        orderBy: [{ totalScore: 'desc' }, { timeTakenSeconds: 'asc' }],
        take: 20,
      });

      const leaderboard = attempts.map((a, index) => ({
        rank: index + 1,
        studentName: a.student.name,
        score: a.totalScore,
        percentage: a.percentage,
        timeTakenSeconds: a.timeTakenSeconds,
        isPassed: a.isPassed,
      }));

      res.status(200).json({ success: true, data: leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Leaderboard failed' });
    }
  }
}
