import { Router } from 'express';
import { ResultController } from '../../controllers/result.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/student', authenticate, ResultController.getStudentResults);
router.get('/analytics', authenticate, ResultController.getStudentAnalytics);
router.get('/leaderboard/:testId', authenticate, ResultController.getTestLeaderboard);
router.get('/:attemptId', authenticate, ResultController.getResultDetails);

export default router;
