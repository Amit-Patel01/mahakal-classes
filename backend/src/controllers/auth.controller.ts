import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { AuthService } from '../services/auth.service';
import { Role } from '@prisma/client';
import { ObjectId } from 'mongodb';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, mobile, password, role, courseId, academicGoal } = req.body;

      const db = getNativeDb();

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({
        $or: [{ email: email.toLowerCase() }, { mobile }],
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message:
            existingUser.email === email.toLowerCase()
              ? 'An account with this email already exists.'
              : 'An account with this mobile number already exists.',
        });
        return;
      }

      const passwordHash = await AuthService.hashPassword(password);
      const userRole: Role = role && Object.values(Role).includes(role) ? role : Role.STUDENT;

      const now = new Date();
      const userId = new ObjectId();

      // Create user using native MongoDB to avoid Prisma replica-set transaction error
      const userDoc = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        mobile,
        passwordHash,
        role: userRole,
        avatarFileId: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('users').insertOne(userDoc);

      // If registered as student, initialize StudentProfile
      if (userRole === Role.STUDENT) {
        const enrollmentNum = 'MC' + Math.floor(100000 + Math.random() * 900000);
        await db.collection('student_profiles').insertOne({
          _id: new ObjectId(),
          userId: userId,
          enrollmentNumber: enrollmentNum,
          courseId: courseId && ObjectId.isValid(courseId) ? new ObjectId(courseId) : null,
          academicGoal: academicGoal || 'Excellence in Competitive Exams',
          parentContact: null,
          address: null,
          createdAt: now,
          updatedAt: now,
        });

        // Auto-enroll in course if provided
        if (courseId && ObjectId.isValid(courseId)) {
          await db.collection('enrollments').insertOne({
            _id: new ObjectId(),
            studentId: userId,
            courseId: new ObjectId(courseId),
            status: 'ACTIVE',
            enrolledAt: now,
          });
        }
      } else if (userRole === Role.TEACHER) {
        await db.collection('teacher_profiles').insertOne({
          _id: new ObjectId(),
          userId: userId,
          designation: 'Faculty Member',
          qualification: 'M.Sc / B.Tech / Subject Specialist',
          bio: null,
          experienceYears: 0,
          specialization: null,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Generate tokens using a user-like object
      const userForToken = {
        id: userId.toString(),
        email: email.toLowerCase(),
        role: userRole,
        name,
      };
      const tokens = AuthService.generateTokens(userForToken as any);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: {
            id: userId.toString(),
            name,
            email: email.toLowerCase(),
            mobile,
            role: userRole,
          },
          ...tokens,
        },
      });
    } catch (error: any) {
      console.error('[Register Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide email/mobile and password.',
        });
        return;
      }

      const cleanId = identifier.trim();
      const digitsOnly = cleanId.replace(/\D/g, '');
      const tenDigit = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

      // Read-only find — safe with Prisma on standalone MongoDB
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanId.toLowerCase() },
            { mobile: cleanId },
            ...(tenDigit ? [{ mobile: tenDigit }] : []),
          ],
        },
        include: {
          studentProfile: {
            include: {
              course: true,
            },
          },
          teacherProfile: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. No user found with provided email/mobile.',
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact Mahakal Classes admin.',
        });
        return;
      }

      const isMatch = await AuthService.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. Incorrect password.',
        });
        return;
      }

      const tokens = AuthService.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            avatarFileId: user.avatarFileId,
            studentProfile: user.studentProfile,
            teacherProfile: user.teacherProfile,
          },
          ...tokens,
        },
      });
    } catch (error: any) {
      console.error('[Login Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required.' });
        return;
      }

      const decoded = AuthService.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'User not found or inactive.' });
        return;
      }

      const tokens = AuthService.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          avatarFileId: true,
          createdAt: true,
          studentProfile: {
            include: {
              course: true,
            },
          },
          teacherProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile' });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name, mobile, address, academicGoal, avatarFileId } = req.body;

      if (!userId || !ObjectId.isValid(userId)) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Use native MongoDB for updates to avoid Prisma transaction errors
      const db = getNativeDb();
      const now = new Date();

      const userUpdate: any = { updatedAt: now };
      if (name) userUpdate.name = name;
      if (mobile) userUpdate.mobile = mobile;
      if (avatarFileId) userUpdate.avatarFileId = avatarFileId;

      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: userUpdate }
      );

      if (req.user?.role === Role.STUDENT) {
        const profileUpdate: any = { updatedAt: now };
        if (address) profileUpdate.address = address;
        if (academicGoal) profileUpdate.academicGoal = academicGoal;

        await db.collection('student_profiles').updateOne(
          { userId: new ObjectId(userId) },
          { $set: profileUpdate }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  }
}
