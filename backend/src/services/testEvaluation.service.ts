import { prisma, getNativeDb } from '../config/db';
import { AttemptStatus } from '@prisma/client';
import { ObjectId } from 'mongodb';

export interface SubmitAnswerInput {
  questionId: string;
  selectedOptionIds: string[];
  isMarkedForReview?: boolean;
}

export class TestEvaluationService {
  /**
   * Evaluates student answers, applies marks and negative marking,
   * updates TestAttempt record, and calculates final score and percentage.
   */
  static async evaluateAttempt(
    attemptId: string,
    studentId: string,
    answersInput: SubmitAnswerInput[]
  ) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error('Test attempt not found.');
    }

    if (attempt.studentId !== studentId) {
      throw new Error('Unauthorized. This attempt does not belong to the student.');
    }

    if (attempt.status === AttemptStatus.SUBMITTED) {
      return attempt; // Already submitted
    }

    const test = attempt.test;
    const questions = test.questions;
    const totalQuestions = questions.length;

    let attemptedCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0.0;

    const answerMap = new Map<string, SubmitAnswerInput>();
    answersInput.forEach((ans) => answerMap.set(ans.questionId, ans));

    // Evaluate each question
    const answersToUpsert = [];

    for (const question of questions) {
      const studentSubmission = answerMap.get(question.id);
      const selectedOptionIds = studentSubmission?.selectedOptionIds || [];
      const hasAnswered = selectedOptionIds.length > 0;

      if (hasAnswered) {
        attemptedCount++;

        // Find correct option IDs for this question
        const correctOptionIds = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);

        // Check if student selected exact correct options
        const isMatch =
          correctOptionIds.length === selectedOptionIds.length &&
          correctOptionIds.every((id) => selectedOptionIds.includes(id));

        let marksAwarded = 0.0;
        let isCorrect = false;

        if (isMatch) {
          isCorrect = true;
          correctCount++;
          marksAwarded = question.marks;
          totalScore += marksAwarded;
        } else {
          wrongCount++;
          // Apply negative marking
          const neg =
            question.negativeMarks > 0
              ? question.negativeMarks
              : question.marks * test.negativeMarkingRate;
          marksAwarded = -Math.abs(neg);
          totalScore += marksAwarded;
        }

        answersToUpsert.push({
          attemptId,
          questionId: question.id,
          selectedOptionIds,
          isCorrect,
          marksAwarded,
          isMarkedForReview: studentSubmission?.isMarkedForReview || false,
        });
      } else {
        // Unattempted
        answersToUpsert.push({
          attemptId,
          questionId: question.id,
          selectedOptionIds: [],
          isCorrect: false,
          marksAwarded: 0,
          isMarkedForReview: studentSubmission?.isMarkedForReview || false,
        });
      }
    }

    const unattemptedCount = totalQuestions - attemptedCount;
    // Cap minimum score to 0 or allow competitive exam negative scoring
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage =
      test.totalMarks > 0
        ? Math.max(0, Math.min(100, Math.round((finalScore / test.totalMarks) * 10000) / 100))
        : 0;
    const isPassed = finalScore >= test.passingMarks;

    const submittedAt = new Date();
    const timeTakenSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
    );

    // Persist all answers using native MongoDB to avoid standalone transaction errors
    const db = getNativeDb();
    const now = new Date();

    for (const ans of answersToUpsert) {
      await db.collection('answers').updateOne(
        {
          attemptId: new ObjectId(attemptId),
          questionId: new ObjectId(ans.questionId),
        },
        {
          $set: {
            attemptId: new ObjectId(attemptId),
            questionId: new ObjectId(ans.questionId),
            selectedOptionIds: ans.selectedOptionIds,
            isCorrect: ans.isCorrect,
            marksAwarded: ans.marksAwarded,
            isMarkedForReview: ans.isMarkedForReview || false,
            updatedAt: now,
          },
          $setOnInsert: {
            _id: new ObjectId(),
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }

    // Update the TestAttempt record using native MongoDB
    await db.collection('test_attempts').updateOne(
      { _id: new ObjectId(attemptId) },
      {
        $set: {
          status: AttemptStatus.SUBMITTED,
          submittedAt,
          timeTakenSeconds,
          totalQuestions,
          attemptedCount,
          correctCount,
          wrongCount,
          unattemptedCount,
          totalScore: finalScore,
          percentage,
          isPassed,
          updatedAt: now,
        },
      }
    );

    // Read full populated object using safe Prisma findUnique
    const updatedAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return updatedAttempt;
  }
}
