import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { ObjectId } from 'mongodb';
import { AuthService } from '../services/auth.service';
import { Role } from '@prisma/client';

export class AdminController {
  static async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalSubjects,
        totalMaterials,
        totalLectures,
        totalTests,
        totalLiveClasses,
        activeLiveNow,
        totalAttempts,
      ] = await Promise.all([
        prisma.user.count({ where: { role: Role.STUDENT } }),
        prisma.user.count({ where: { role: Role.TEACHER } }),
        prisma.course.count(),
        prisma.subject.count(),
        prisma.material.count(),
        prisma.lecture.count(),
        prisma.test.count(),
        prisma.liveClass.count(),
        prisma.liveClass.count({ where: { status: 'LIVE' } }),
        prisma.testAttempt.count({ where: { status: 'SUBMITTED' } }),
      ]);

      // Calculate average score across all tests
      const completedAttempts = await prisma.testAttempt.findMany({
        where: { status: 'SUBMITTED' },
        select: { percentage: true, isPassed: true },
      });

      const avgScore =
        completedAttempts.length > 0
          ? Math.round(
              (completedAttempts.reduce((a, b) => a + b.percentage, 0) /
                completedAttempts.length) *
                10
            ) / 10
          : 0;

      const passRate =
        completedAttempts.length > 0
          ? Math.round(
              (completedAttempts.filter((a) => a.isPassed).length /
                completedAttempts.length) *
                1000
            ) / 10
          : 0;

      // Course enrollment distribution
      const courses = await prisma.course.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: { enrollments: true, materials: true, tests: true },
          },
        },
      });

      const courseDistribution = courses.map((c) => ({
        courseName: c.title,
        studentsCount: c._count.enrollments,
        materialsCount: c._count.materials,
        testsCount: c._count.tests,
      }));

      // Growth telemetry mockup for charts
      const studentGrowth = [
        { month: 'Oct', students: Math.max(12, Math.floor(totalStudents * 0.4)) },
        { month: 'Nov', students: Math.max(28, Math.floor(totalStudents * 0.6)) },
        { month: 'Dec', students: Math.max(45, Math.floor(totalStudents * 0.75)) },
        { month: 'Jan', students: Math.max(70, Math.floor(totalStudents * 0.88)) },
        { month: 'Feb', students: Math.max(92, Math.floor(totalStudents * 0.95)) },
        { month: 'Mar', students: totalStudents || 110 },
      ];

      res.status(200).json({
        success: true,
        data: {
          counts: {
            totalStudents,
            totalTeachers,
            totalCourses,
            totalSubjects,
            totalMaterials,
            totalLectures,
            totalTests,
            totalLiveClasses,
            activeLiveNow,
            totalAttempts,
            avgScore,
            passRate,
          },
          studentGrowth,
          courseDistribution,
        },
      });
    } catch (error: any) {
      console.error('[Admin Stats Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Stats calculation failed' });
    }
  }

  static async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const { search, courseId } = req.query;

      const students = await prisma.user.findMany({
        where: {
          role: Role.STUDENT,
          ...(search && {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } },
              { mobile: { contains: String(search), mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          studentProfile: {
            include: {
              course: true,
            },
          },
          _count: {
            select: {
              testAttempts: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: students });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch students' });
    }
  }

  static async getTeachers(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await prisma.user.findMany({
        where: { role: Role.TEACHER },
        include: {
          teacherProfile: true,
          _count: {
            select: {
              lecturesTaught: true,
              liveClassesTaught: true,
              testsCreated: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: teachers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch teachers' });
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
      });

      res.status(200).json({
        success: true,
        message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  }

  static async createTeacher(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        email,
        mobile,
        password,
        designation,
        qualification,
        specialization,
        experienceYears,
      } = req.body;

      if (!name || !email || !mobile) {
        res.status(400).json({ success: false, message: 'Name, email, and mobile are required.' });
        return;
      }

      const db = getNativeDb();
      const usersCol = db.collection('users');
      const teacherProfilesCol = db.collection('teacher_profiles');

      const existing = await usersCol.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { mobile: mobile.trim() }],
      });

      if (existing) {
        res.status(409).json({ success: false, message: 'User with this email or mobile already exists.' });
        return;
      }

      const passwordHash = await AuthService.hashPassword(password || 'Teacher@123');
      const now = new Date();

      const userInsert = await usersCol.insertOne({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        passwordHash,
        role: 'TEACHER',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const profileInsert = await teacherProfilesCol.insertOne({
        userId: userInsert.insertedId,
        designation: designation || 'Faculty Member',
        qualification: qualification || 'Post Graduate / Master',
        specialization: specialization || 'Core Subject',
        experienceYears: parseInt(experienceYears, 10) || 5,
        createdAt: now,
        updatedAt: now,
      });

      res.status(201).json({
        success: true,
        message: 'Teacher account created successfully',
        data: {
          id: userInsert.insertedId.toString(),
          name,
          email,
          mobile,
          role: 'TEACHER',
          teacherProfile: {
            id: profileInsert.insertedId.toString(),
            designation: designation || 'Faculty Member',
            qualification: qualification || 'Post Graduate / Master',
            specialization: specialization || 'Core Subject',
          },
        },
      });
    } catch (error: any) {
      console.error('[Create Teacher Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create teacher' });
    }
  }

  static async deleteTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const db = getNativeDb();
      const objId = new ObjectId(id);
      await db.collection('teacher_profiles').deleteMany({ userId: objId });
      await db.collection('users').deleteOne({ _id: objId });
      res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete teacher' });
    }
  }
}

