import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/academic_models.dart';
import '../../providers/auth_provider.dart';

class LecturesScreen extends ConsumerStatefulWidget {
  final String? initialCourseId;
  const LecturesScreen({Key? key, this.initialCourseId}) : super(key: key);

  @override
  ConsumerState<LecturesScreen> createState() => _LecturesScreenState();
}

class _LecturesScreenState extends ConsumerState<LecturesScreen> {
  List<CourseModel> _courses = [];
  String? _selectedCourseId;
  List<LectureModel> _lectures = [];
  bool _loadingCourses = true;
  bool _loadingLectures = false;

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _loadingCourses = true);
    final client = ref.read(apiClientProvider);

    try {
      final res = await client.get(ApiConstants.courses);
      if (res.data['success'] == true && res.data['data'] != null) {
        final list = (res.data['data'] as List)
            .map((c) => CourseModel.fromJson(c))
            .toList();

        setState(() {
          _courses = list;
          if (widget.initialCourseId != null &&
              list.any((c) => c.id == widget.initialCourseId)) {
            _selectedCourseId = widget.initialCourseId;
          } else if (list.isNotEmpty) {
            _selectedCourseId = list.first.id;
          }
        });

        if (_selectedCourseId != null) {
          _fetchLectures(_selectedCourseId!);
        }
      }
    } catch (_) {}
    setState(() => _loadingCourses = false);
  }

  Future<void> _fetchLectures(String courseId) async {
    setState(() => _loadingLectures = true);
    final client = ref.read(apiClientProvider);

    try {
      final res = await client.get('${ApiConstants.lectures}/course/$courseId');
      if (res.data['success'] == true && res.data['data'] != null) {
        setState(() {
          _lectures = (res.data['data'] as List)
              .map((l) => LectureModel.fromJson(l))
              .toList();
        });
      } else {
        setState(() => _lectures = []);
      }
    } catch (_) {
      setState(() => _lectures = []);
    }
    setState(() => _loadingLectures = false);
  }

  void _playVideo(LectureModel lecture) async {
    String? targetUrl = lecture.videoUrl;

    if (targetUrl == null || targetUrl.isEmpty) {
      if (lecture.videoFileId != null && lecture.videoFileId!.isNotEmpty) {
        targetUrl = ApiConstants.streamUrl(lecture.videoFileId!);
      }
    }

    if (targetUrl == null || targetUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No playable video stream link found.')),
      );
      return;
    }

    final uri = Uri.parse(targetUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch video URL.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Recorded Video Lectures'),
      ),
      body: _loadingCourses
          ? const Center(child: CircularProgressIndicator())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Horizontal course selector
                if (_courses.isNotEmpty)
                  Container(
                    height: 54,
                    color: Colors.white,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        final course = _courses[index];
                        final isSelected = _selectedCourseId == course.id;

                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(
                              course.title,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isSelected
                                    ? Colors.white
                                    : AppTheme.textDark,
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: AppTheme.primaryBlue,
                            backgroundColor: const Color(0xFFF1F5F9),
                            onSelected: (selected) {
                              if (selected) {
                                setState(() => _selectedCourseId = course.id);
                                _fetchLectures(course.id);
                              }
                            },
                          ),
                        );
                      },
                    ),
                  ),

                // Lectures list
                Expanded(
                  child: _loadingLectures
                      ? const Center(child: CircularProgressIndicator())
                      : _lectures.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.video_library_outlined,
                                      size: 56, color: Colors.grey.shade400),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'No lectures uploaded for this batch yet.',
                                    style: TextStyle(
                                        fontSize: 14, color: Colors.grey),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Faculty uploads will appear here automatically.',
                                    style: TextStyle(
                                        fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _lectures.length,
                              itemBuilder: (context, index) {
                                final lec = _lectures[index];
                                final hasVideo = (lec.videoUrl != null &&
                                        lec.videoUrl!.isNotEmpty) ||
                                    (lec.videoFileId != null &&
                                        lec.videoFileId!.isNotEmpty);

                                final isYouTube =
                                    lec.videoUrl?.contains('youtu') == true;
                                final isDrive =
                                    lec.videoUrl?.contains('drive.google.com') ==
                                        true;

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        // Video Thumbnail Placeholder
                                        Container(
                                          width: 72,
                                          height: 72,
                                          decoration: BoxDecoration(
                                            color: isYouTube
                                                ? const Color(0xFFFEE2E2)
                                                : isDrive
                                                    ? const Color(0xFFE0F2FE)
                                                    : const Color(0xFFEDE9FE),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Center(
                                            child: Icon(
                                              isYouTube
                                                  ? Icons.smart_display_rounded
                                                  : isDrive
                                                      ? Icons.cloud_play_rounded
                                                      : Icons.play_circle_fill_rounded,
                                              size: 34,
                                              color: isYouTube
                                                  ? Colors.red
                                                  : isDrive
                                                      ? Colors.blue.shade700
                                                      : const Color(0xFF7C3AED),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 14),

                                        // Details
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: [
                                                  if (lec.subjectName != null &&
                                                      lec.subjectName!.isNotEmpty)
                                                    Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 6,
                                                          vertical: 2),
                                                      margin:
                                                          const EdgeInsets.only(
                                                              right: 6),
                                                      decoration: BoxDecoration(
                                                        color: const Color(
                                                            0xFFF1F5F9),
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(4),
                                                      ),
                                                      child: Text(
                                                        lec.subjectName!,
                                                        style: const TextStyle(
                                                          fontSize: 10,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color:
                                                              Color(0xFF475569),
                                                        ),
                                                      ),
                                                    ),
                                                  if (lec.durationMinutes > 0)
                                                    Text(
                                                      '${lec.durationMinutes} mins',
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color: Colors.grey,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                lec.title,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color:
                                                      AppTheme.primaryBlueDark,
                                                ),
                                              ),
                                              if (lec.description.isNotEmpty) ...[
                                                const SizedBox(height: 3),
                                                Text(
                                                  lec.description,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    color: Color(0xFF64748B),
                                                  ),
                                                ),
                                              ],
                                              const SizedBox(height: 8),
                                              ElevatedButton.icon(
                                                onPressed: hasVideo
                                                    ? () => _playVideo(lec)
                                                    : null,
                                                icon: const Icon(
                                                    Icons.play_arrow_rounded,
                                                    size: 16),
                                                label: Text(
                                                  isYouTube
                                                      ? 'Watch on YouTube'
                                                      : isDrive
                                                          ? 'Watch on Drive'
                                                          : 'Play Lecture',
                                                  style: const TextStyle(
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.w700),
                                                ),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor:
                                                      AppTheme.primaryBlue,
                                                  foregroundColor: Colors.white,
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                          horizontal: 12,
                                                          vertical: 6),
                                                  minimumSize: Size.zero,
                                                  tapTargetSize:
                                                      MaterialTapTargetSize
                                                          .shrinkWrap,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                  ),
                                                  elevation: 0,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                ),
              ],
            ),
    );
  }
}
