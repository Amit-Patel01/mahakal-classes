import { prisma, connectMongo, getNativeDb } from './config/db';
import { env } from './config/env';
import { AuthService } from './services/auth.service';
import { GridFSService } from './services/gridfs.service';
import {
  Role,
  MaterialCategory,
  LiveStatus,
  QuestionType,
  GalleryCategory,
} from '@prisma/client';

async function seed() {
  console.log('[Seed] Initializing Mahakal Classes Database with Demo Records...');

  await connectMongo();
  await prisma.$connect();

  // 1. Clean existing records using native driver (works on standalone MongoDB)
  const nativeDb = getNativeDb();
  const collections = [
    'answers',
    'test_attempts',
    'question_options',
    'questions',
    'tests',
    'materials',
    'lecture_progress',
    'lectures',
    'live_classes',
    'chapters',
    'subjects',
    'enrollments',
    'student_profiles',
    'teacher_profiles',
    'courses',
    'gallery',
    'notifications',
    'announcements',
    'users',
  ];
  for (const col of collections) {
    try {
      await nativeDb.collection(col).deleteMany({});
    } catch (_) {}
  }

  console.log('[Seed] Cleared collections.');

  // 2. Create Dummy sample PDF buffer in GridFS
  const samplePdfBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
  );

  const sampleGridFsFile = await GridFSService.uploadBuffer(
    samplePdfBuffer,
    'Mahakal_Classes_Physics_Formula_Handbook.pdf',
    'application/pdf',
    { author: 'Mahakal Faculty' }
  );

  console.log(`[Seed] Seeded sample GridFS PDF (ID: ${sampleGridFsFile.fileId})`);

  // 3. Create Users
  const passwordHash = await AuthService.hashPassword('Password@123');

  // Admin from .env
  const adminPasswordHash = await AuthService.hashPassword(env.ADMIN_PASSWORD);
  const adminUser = await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      mobile: env.ADMIN_MOBILE,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Teacher
  const teacherUser = await prisma.user.create({
    data: {
      name: 'Prof. Alok Verma',
      email: 'teacher@mahakalclasses.com',
      mobile: '9876543211',
      passwordHash,
      role: Role.TEACHER,
    },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      designation: 'Senior Faculty - Physics & Maths',
      qualification: 'M.Tech IIT Roorkee, 12+ Years Teaching Experience',
      bio: 'Specialist in Mechanics, Electrodynamics, and Olympiad problem-solving.',
      experienceYears: 12,
      specialization: 'JEE Advanced Physics',
    },
  });

  // Student
  const studentUser = await prisma.user.create({
    data: {
      name: 'Amit Kumar Patel',
      email: 'student@mahakalclasses.com',
      mobile: '9876543212',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  // 4. Create Courses
  const jeeCourse = await prisma.course.create({
    data: {
      title: 'IIT-JEE Target 2026 (Physics, Chemistry & Math)',
      slug: 'iit-jee-target-2026',
      code: 'JEE-2026',
      description:
        'Comprehensive 2-year preparation covering Class 11th & 12th syllabus, live masterclasses, chapter-wise test series, and personalized mentoring.',
      duration: '2 Years',
      price: 19999.0,
      thumbnailFileId: sampleGridFsFile.fileId,
      isPublished: true,
    },
  });

  const neetCourse = await prisma.course.create({
    data: {
      title: 'NEET UG 2026 Droppers & Conquerors Batch',
      slug: 'neet-ug-2026-batch',
      code: 'NEET-2026',
      description:
        'Targeted Medical entrance batch with 100% NCERT line-by-line coverage, diagrammatic clarity, and daily high-yield tests.',
      duration: '1 Year',
      price: 17999.0,
      thumbnailFileId: sampleGridFsFile.fileId,
      isPublished: true,
    },
  });

  // Enroll Student in JEE Course
  await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      enrollmentNumber: 'MC2026001',
      courseId: jeeCourse.id,
      parentContact: '9876500000',
      address: 'Varanasi, Uttar Pradesh, India',
      academicGoal: 'Secure Under AIR 500 in IIT-JEE Advanced',
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: studentUser.id,
      courseId: jeeCourse.id,
      status: 'ACTIVE',
    },
  });

  // 5. Create Subjects for JEE
  const physicsSubject = await prisma.subject.create({
    data: {
      courseId: jeeCourse.id,
      name: 'Physics (Advanced Mechanics & Optics)',
      code: 'PHY-JEE',
      description: 'Rotational Dynamics, Laws of Motion, Gravitation, Wave Optics',
      icon: 'Atom',
    },
  });

  const mathSubject = await prisma.subject.create({
    data: {
      courseId: jeeCourse.id,
      name: 'Mathematics (Calculus & Coordinate Geometry)',
      code: 'MATH-JEE',
      description: 'Differential Calculus, Integration, Conic Sections, Vectors',
      icon: 'Calculator',
    },
  });

  // 6. Create Chapters
  const chapter1 = await prisma.chapter.create({
    data: {
      subjectId: physicsSubject.id,
      title: 'Chapter 01: Kinematics & Projectile Motion in 2D',
      orderIndex: 1,
      description: 'Trajectory equations, maximum range on incline, relative velocity.',
    },
  });

  const chapter2 = await prisma.chapter.create({
    data: {
      subjectId: physicsSubject.id,
      title: 'Chapter 02: Rotational Dynamics & Moment of Inertia',
      orderIndex: 2,
      description: 'Rolling without slipping, angular momentum conservation.',
    },
  });

  // 7. Create HE Materials
  await prisma.material.createMany({
    data: [
      {
        courseId: jeeCourse.id,
        subjectId: physicsSubject.id,
        chapterId: chapter1.id,
        title: 'Complete Kinematics Derivation & Concept Notes',
        description: 'Comprehensive handwritten class notes by Prof. Alok Verma.',
        category: MaterialCategory.NOTES,
        fileId: sampleGridFsFile.fileId,
        fileName: 'Kinematics_Concept_Notes_V1.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576,
        uploadedById: teacherUser.id,
      },
      {
        courseId: jeeCourse.id,
        subjectId: physicsSubject.id,
        chapterId: chapter1.id,
        title: 'Previous 15 Years IIT-JEE Questions with Video QR Codes',
        description: 'Past year papers classified chapter-wise with detailed hints.',
        category: MaterialCategory.PREVIOUS_YEAR,
        fileId: sampleGridFsFile.fileId,
        fileName: 'PYQ_Kinematics_2010_2025.pdf',
        fileType: 'application/pdf',
        fileSize: 2097152,
        uploadedById: teacherUser.id,
      },
      {
        courseId: jeeCourse.id,
        subjectId: physicsSubject.id,
        chapterId: chapter2.id,
        title: 'Weekly Graded Assignment 03: Moment of Inertia',
        description: 'Submission deadline: Friday 11:59 PM. Includes 25 numerical problems.',
        category: MaterialCategory.ASSIGNMENT,
        fileId: sampleGridFsFile.fileId,
        fileName: 'Assignment_03_Rotation.pdf',
        fileType: 'application/pdf',
        fileSize: 524288,
        uploadedById: teacherUser.id,
      },
      {
        courseId: jeeCourse.id,
        subjectId: mathSubject.id,
        title: 'Differential Calculus High-Yield Formula Handbook',
        description: 'Essential shortcuts for limits, derivatives, and tangents.',
        category: MaterialCategory.STUDY_MATERIAL,
        fileId: sampleGridFsFile.fileId,
        fileName: 'Calculus_Formula_Sheet.pdf',
        fileType: 'application/pdf',
        fileSize: 1572864,
        uploadedById: teacherUser.id,
      },
    ],
  });

  // 8. Create Recorded Lectures
  await prisma.lecture.create({
    data: {
      courseId: jeeCourse.id,
      subjectId: physicsSubject.id,
      chapterId: chapter1.id,
      teacherId: teacherUser.id,
      title: 'L-01: Vector Resolution & Relative Velocity on River-Boat Problems',
      description: 'Deep dive into 2D kinematics with real-world vectors and river crossings.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Demo embeddable or streaming
      durationMinutes: 65,
      orderIndex: 1,
    },
  });

  await prisma.lecture.create({
    data: {
      courseId: jeeCourse.id,
      subjectId: physicsSubject.id,
      chapterId: chapter1.id,
      teacherId: teacherUser.id,
      title: 'L-02: Projectile Motion on Inclined Plane & Rain-Man Problems',
      description: 'Coordinate transformation along the incline with advanced problems.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      durationMinutes: 72,
      orderIndex: 2,
    },
  });

  // 9. Create Live Classes
  // One LIVE right now for instant demonstration!
  await prisma.liveClass.create({
    data: {
      courseId: jeeCourse.id,
      subjectId: physicsSubject.id,
      teacherId: teacherUser.id,
      title: '🔴 LIVE NOW: Problem Solving Marathon on Rotational Dynamics',
      description: 'Interactive problem session with live poll doubts and tricky JEE questions.',
      scheduledDate: new Date(),
      startTime: '08:00 PM',
      endTime: '10:00 PM',
      streamUrl: 'https://www.youtube.com/embed/live_stream?channel=mahakalclasses',
      streamPlatform: 'YouTube Live',
      status: LiveStatus.LIVE,
    },
  });

  // One upcoming
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.liveClass.create({
    data: {
      courseId: jeeCourse.id,
      subjectId: mathSubject.id,
      teacherId: teacherUser.id,
      title: 'Upcoming: Definite Integration by King & Queen Properties',
      description: 'Mastering special integration tricks for JEE Advanced.',
      scheduledDate: tomorrow,
      startTime: '06:00 PM',
      endTime: '07:30 PM',
      streamUrl: 'https://zoom.us/j/1234567890',
      streamPlatform: 'Zoom Meeting',
      status: LiveStatus.UPCOMING,
    },
  });

  // 10. Create Online Test with Questions & Options
  const mockTest = await prisma.test.create({
    data: {
      courseId: jeeCourse.id,
      subjectId: physicsSubject.id,
      teacherId: teacherUser.id,
      title: 'JEE Advanced National Mock Test 01 (Physics & Math)',
      description:
        'Standard 60-minute test simulating real examination pattern. +4 for correct, -1 for incorrect.',
      durationMinutes: 60,
      totalMarks: 40.0,
      passingMarks: 16.0,
      negativeMarkingRate: 0.25,
      isPublished: true,
      instructions:
        '1. Total 10 questions. Marks: +4 per correct answer.\n2. Negative Marking: -1 per wrong answer.\n3. Timer will auto-submit upon reaching 00:00.\n4. You can mark questions for review and revisit anytime using the question palette.',
    },
  });

  // Questions
  const q1 = await prisma.question.create({
    data: {
      testId: mockTest.id,
      questionText:
        'A particle is projected with velocity u at an angle θ with the horizontal. What is its radius of curvature at the highest point of its trajectory?',
      type: QuestionType.SINGLE_CHOICE,
      marks: 4.0,
      negativeMarks: 1.0,
      explanation:
        'At the highest point, velocity is horizontal v = u*cos(θ), and acceleration is vertically downwards a = g. Radius of curvature R = v^2 / a_normal = (u^2 * cos^2(θ)) / g.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      { questionId: q1.id, optionText: '(u² cos²θ) / g', isCorrect: true, orderIndex: 0 },
      { questionId: q1.id, optionText: '(u² sin²θ) / g', isCorrect: false, orderIndex: 1 },
      { questionId: q1.id, optionText: 'u² / g', isCorrect: false, orderIndex: 2 },
      { questionId: q1.id, optionText: '(u² cosθ) / (2g)', isCorrect: false, orderIndex: 3 },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      testId: mockTest.id,
      questionText:
        'A solid cylinder and a hollow cylinder of equal mass and radius roll down an incline without slipping. Which one reaches the bottom first?',
      type: QuestionType.SINGLE_CHOICE,
      marks: 4.0,
      negativeMarks: 1.0,
      explanation:
        'Acceleration down an incline is a = g*sin(θ) / (1 + I/(m*R^2)). For solid cylinder, I = 0.5*m*R^2 (a = 2/3*g*sinθ). For hollow, I = m*R^2 (a = 1/2*g*sinθ). Hence the solid cylinder has higher acceleration and reaches first.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      { questionId: q2.id, optionText: 'Solid cylinder', isCorrect: true, orderIndex: 0 },
      { questionId: q2.id, optionText: 'Hollow cylinder', isCorrect: false, orderIndex: 1 },
      { questionId: q2.id, optionText: 'Both reach at the exact same time', isCorrect: false, orderIndex: 2 },
      { questionId: q2.id, optionText: 'Depends on the angle of inclination', isCorrect: false, orderIndex: 3 },
    ],
  });

  const q3 = await prisma.question.create({
    data: {
      testId: mockTest.id,
      questionText:
        'In pure rolling on a stationary rough horizontal plane, the work done by static friction on the rolling body is always zero.',
      type: QuestionType.TRUE_FALSE,
      marks: 4.0,
      negativeMarks: 1.0,
      explanation:
        'True. The point of contact is instantaneously at rest, so the instantaneous displacement of the point of application of static friction is zero.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      { questionId: q3.id, optionText: 'True', isCorrect: true, orderIndex: 0 },
      { questionId: q3.id, optionText: 'False', isCorrect: false, orderIndex: 1 },
    ],
  });

  console.log(`[Seed] Seeded Mock Test with ID ${mockTest.id}`);

  // 11. Create Photo Gallery Items
  await prisma.gallery.createMany({
    data: [
      {
        title: 'Annual Felicitation of Top 100 IIT-JEE Achievers',
        category: GalleryCategory.ACHIEVEMENTS,
        imageFileId: sampleGridFsFile.fileId,
        description: 'Celebrating 50+ selections in IIT Bombay, Delhi, and Kanpur from Mahakal Classes.',
        eventDate: new Date('2025-06-15'),
      },
      {
        title: 'Smart Interactive Classroom at Mahakal Main Campus',
        category: GalleryCategory.CLASSROOM,
        imageFileId: sampleGridFsFile.fileId,
        description: 'High-tech smart podiums, digital interactive whiteboards, and comfortable tiered seating.',
        eventDate: new Date('2025-08-10'),
      },
      {
        title: 'National Science Day Seminar by Renowned Scientists',
        category: GalleryCategory.SEMINARS,
        imageFileId: sampleGridFsFile.fileId,
        description: 'Inspiring session with ISRO visiting scientists and faculty members.',
        eventDate: new Date('2026-02-28'),
      },
    ],
  });

  // 12. Create Announcements & Notifications
  await prisma.announcement.create({
    data: {
      title: '📢 All India Mahakal Open Scholarship Test (MOST 2026) Announced',
      content:
        'Registration is now live for MOST 2026 with up to 100% tuition scholarships for aspiring engineers and doctors. Check details in your student portal.',
      isPinned: true,
      publishedById: adminUser.id,
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: studentUser.id,
      title: 'Welcome to Mahakal Classes!',
      message: 'Your enrollment in IIT-JEE Target 2026 is active. Access your study material now.',
      type: 'SYSTEM',
    },
  });

  console.log('================================================================');
  console.log('✅ Mahakal Classes Database successfully seeded with demo data!');
  console.log('Admin Login:   admin@mahakalclasses.com   / Password@123');
  console.log('Teacher Login: teacher@mahakalclasses.com / Password@123');
  console.log('Student Login: student@mahakalclasses.com / Password@123');
  console.log('================================================================');

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
