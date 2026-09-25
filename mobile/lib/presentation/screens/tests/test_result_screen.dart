import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/test_model.dart';
import '../main_nav_screen.dart';

class TestResultScreen extends StatelessWidget {
  final AttemptResultModel result;
  final String testTitle;

  const TestResultScreen({
    Key? key,
    required this.result,
    required this.testTitle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Examination Scorecard'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Score Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.primaryBlueDark,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryBlueDark.withOpacity(0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    testTitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: result.isPassed
                          ? AppTheme.successGreen.withOpacity(0.2)
                          : Colors.red.withOpacity(0.2),
                      border: Border.all(
                        color: result.isPassed
                            ? AppTheme.successGreen
                            : Colors.redAccent,
                        width: 3,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${result.percentage.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: result.isPassed
                                ? AppTheme.successGreen
                                : Colors.redAccent,
                          ),
                        ),
                        Text(
                          result.isPassed ? 'PASSED' : 'FAILED',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: result.isPassed
                                ? AppTheme.successGreen
                                : Colors.redAccent,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Score Obtained: ${result.totalScore}',
                    style: const TextStyle(
                      color: AppTheme.primaryBlue,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Time Taken: ${result.timeTakenSeconds ~/ 60}m ${result.timeTakenSeconds % 60}s',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Metrics Breakdown
            Row(
              children: [
                _metricBox(
                  'Questions',
                  '${result.totalQuestions}',
                  Colors.blue,
                  Icons.help_outline,
                ),
                const SizedBox(width: 10),
                _metricBox(
                  'Attempted',
                  '${result.attemptedCount}',
                  Colors.purple,
                  Icons.touch_app,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _metricBox(
                  'Correct',
                  '${result.correctCount}',
                  AppTheme.successGreen,
                  Icons.check_circle_outline,
                ),
                const SizedBox(width: 10),
                _metricBox(
                  'Wrong',
                  '${result.wrongCount}',
                  Colors.red,
                  Icons.cancel_outlined,
                ),
              ],
            ),
            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const MainNavScreen()),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: AppTheme.primaryBlueDark,
                ),
                child: const Text('Back to Dashboard'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _metricBox(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
