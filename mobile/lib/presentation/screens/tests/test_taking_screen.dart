import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/test_model.dart';
import '../../providers/auth_provider.dart';
import 'test_result_screen.dart';

class TestTakingScreen extends ConsumerStatefulWidget {
  final String testId;

  const TestTakingScreen({Key? key, required this.testId}) : super(key: key);

  @override
  ConsumerState<TestTakingScreen> createState() => _TestTakingScreenState();
}

class _TestTakingScreenState extends ConsumerState<TestTakingScreen> {
  TestModel? _test;
  String? _attemptId;
  int _currentIndex = 0;
  int _secondsRemaining = 3600;
  Timer? _timer;
  bool _loading = true;
  bool _submitting = false;

  // Selected answers: { questionId: [optionId] }
  final Map<String, List<String>> _selectedAnswers = {};
  // Marked for review: { questionId: true/false }
  final Map<String, bool> _markedForReview = {};

  @override
  void initState() {
    super.initState();
    _initTest();
  }

  Future<void> _initTest() async {
    final client = ref.read(apiClientProvider);

    try {
      // 1. Fetch test questions without answer keys
      final res = await client.get('/tests/${widget.testId}/take');
      if (res.data['success'] == true && res.data['data'] != null) {
        final test = TestModel.fromJson(res.data['data']);
        setState(() {
          _test = test;
          _secondsRemaining = test.durationMinutes * 60;
        });

        // 2. Start or resume attempt on backend
        final startRes = await client.post('/tests/${widget.testId}/start');
        if (startRes.data['success'] == true && startRes.data['data'] != null) {
          _attemptId = startRes.data['data']['id'];
        }

        _startTimer();
      }
    } catch (_) {}

    setState(() => _loading = false);
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        _handleAutoSubmit();
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  void _handleAutoSubmit() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('⏱ Time is up! Submitting examination automatically...'),
        backgroundColor: Colors.red,
      ),
    );
    _submitTest();
  }

  void _onOptionSelected(String questionId, String optionId, String type) {
    setState(() {
      if (type == 'MULTIPLE_CHOICE') {
        final current = _selectedAnswers[questionId] ?? [];
        if (current.contains(optionId)) {
          _selectedAnswers[questionId] = current.where((id) => id != optionId).toList();
        } else {
          _selectedAnswers[questionId] = [...current, optionId];
        }
      } else {
        _selectedAnswers[questionId] = [optionId];
      }
    });
  }

  void _toggleReview(String questionId) {
    setState(() {
      _markedForReview[questionId] = !(_markedForReview[questionId] ?? false);
    });
  }

  void _clearAnswer(String questionId) {
    setState(() {
      _selectedAnswers.remove(questionId);
    });
  }

  Future<void> _submitTest() async {
    if (_attemptId == null || _submitting) return;
    setState(() => _submitting = true);
    _timer?.cancel();

    final client = ref.read(apiClientProvider);

    final payloadAnswers = _selectedAnswers.entries.map((e) {
      return {
        'questionId': e.key,
        'selectedOptionIds': e.value,
        'isMarkedForReview': _markedForReview[e.key] ?? false,
      };
    }).toList();

    try {
      final res = await client.post(
        '/tests/attempts/$_attemptId/submit',
        data: {'answers': payloadAnswers},
      );

      if (res.data['success'] == true && res.data['data'] != null) {
        final result = AttemptResultModel.fromJson(res.data['data']);
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => TestResultScreen(
                result: result,
                testTitle: _test?.title ?? 'Test Result',
              ),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.data['message'] ?? 'Submission failed.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error while submitting test.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showPaletteModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Question Palette',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(_test!.questions!.length, (idx) {
                  final q = _test!.questions![idx];
                  final isAnswered =
                      _selectedAnswers[q.id]?.isNotEmpty ?? false;
                  final isReview = _markedForReview[q.id] ?? false;
                  final isCurrent = idx == _currentIndex;

                  Color bg = Colors.grey.shade200;
                  Color fg = Colors.black87;
                  if (isAnswered) {
                    bg = AppTheme.successGreen;
                    fg = Colors.white;
                  }
                  if (isReview) {
                    bg = Colors.purple;
                    fg = Colors.white;
                  }
                  if (isCurrent) {
                    bg = AppTheme.primaryBlue;
                    fg = AppTheme.primaryBlueDark;
                  }

                  return InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      setState(() => _currentIndex = idx);
                    },
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${idx + 1}',
                        style: TextStyle(color: fg, fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  String _formatTime(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading || _test == null || _test!.questions == null) {
      return const Scaffold(
        backgroundColor: AppTheme.primaryBlueDark,
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.primaryBlue),
        ),
      );
    }

    final questions = _test!.questions!;
    final currentQ = questions[_currentIndex];
    final selectedIds = _selectedAnswers[currentQ.id] ?? [];
    final isReviewed = _markedForReview[currentQ.id] ?? false;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          _test!.title,
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _secondsRemaining < 300
                  ? Colors.red.withOpacity(0.2)
                  : AppTheme.primaryBlue.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: _secondsRemaining < 300
                    ? Colors.redAccent
                    : AppTheme.primaryBlue,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, size: 14, color: AppTheme.primaryBlue),
                const SizedBox(width: 4),
                Text(
                  _formatTime(_secondsRemaining),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryBlue,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.grid_view),
            onPressed: _showPaletteModal,
            tooltip: 'Question Palette',
          ),
        ],
      ),
      body: Column(
        children: [
          // Question Header indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Question ${_currentIndex + 1} of ${questions.length}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryBlueDark,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '+${currentQ.marks}',
                        style: const TextStyle(
                            fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '-${currentQ.negativeMarks}',
                        style: const TextStyle(
                            fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Question statement & options
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    currentQ.questionText,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryBlueDark,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Options
                  ...currentQ.options.map((opt) {
                    final isSelected = selectedIds.contains(opt.id);

                    return InkWell(
                      onTap: () => _onOptionSelected(currentQ.id, opt.id, currentQ.type),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryBlue.withOpacity(0.12)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected
                                ? AppTheme.primaryBlue
                                : const Color(0xFFE2E8F0),
                            width: isSelected ? 1.5 : 1.0,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected
                                    ? AppTheme.primaryBlue
                                    : Colors.transparent,
                                border: Border.all(
                                  color: isSelected
                                      ? AppTheme.primaryBlue
                                      : Colors.grey.shade400,
                                ),
                              ),
                              child: isSelected
                                  ? const Icon(Icons.check, size: 14, color: AppTheme.primaryBlueDark)
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                opt.optionText,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                  color: AppTheme.primaryBlueDark,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(
                    isReviewed ? Icons.bookmark : Icons.bookmark_border,
                    color: isReviewed ? Colors.purple : Colors.grey,
                  ),
                  onPressed: () => _toggleReview(currentQ.id),
                  tooltip: 'Mark for Review',
                ),
                TextButton(
                  onPressed: () => _clearAnswer(currentQ.id),
                  child: const Text('Clear', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ),
                const Spacer(),
                if (_currentIndex > 0)
                  OutlinedButton(
                    onPressed: () => setState(() => _currentIndex--),
                    child: const Text('Prev'),
                  ),
                const SizedBox(width: 8),
                if (_currentIndex < questions.length - 1)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentIndex++),
                    child: const Text('Next'),
                  )
                else
                  ElevatedButton(
                    onPressed: _submitting ? null : _submitTest,
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successGreen),
                    child: _submitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('Submit Test', style: TextStyle(color: Colors.white)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
