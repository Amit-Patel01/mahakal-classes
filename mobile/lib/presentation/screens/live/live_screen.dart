import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/academic_models.dart';
import '../../providers/auth_provider.dart';

class LiveScreen extends ConsumerStatefulWidget {
  const LiveScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LiveScreen> createState() => _LiveScreenState();
}

class _LiveScreenState extends ConsumerState<LiveScreen> {
  List<LiveClassModel> _classes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchLiveClasses();
  }

  Future<void> _fetchLiveClasses() async {
    setState(() => _loading = true);
    final client = ref.read(apiClientProvider);

    try {
      final res = await client.get(ApiConstants.liveClasses);
      if (res.data['success'] == true && res.data['data'] != null) {
        setState(() {
          _classes = (res.data['data'] as List)
              .map((c) => LiveClassModel.fromJson(c))
              .toList();
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  void _joinLive(String streamUrl) async {
    final url = Uri.parse(streamUrl);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open live stream link.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Live Classrooms'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _classes.isEmpty
              ? const Center(
                  child: Text(
                    'No scheduled live sessions right now.',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _classes.length,
                  itemBuilder: (context, index) {
                    final lc = _classes[index];
                    final isLive = lc.isLive;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 14),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isLive ? Colors.red : Colors.grey.shade200,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    isLive ? '🔴 LIVE NOW' : lc.status,
                                    style: TextStyle(
                                      color: isLive ? Colors.white : Colors.black87,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${lc.startTime} - ${lc.endTime}',
                                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              lc.title,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryBlueDark,
                              ),
                            ),
                            if (lc.description.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                lc.description,
                                style: const TextStyle(
                                    fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Faculty: ${lc.teacherName ?? "Senior Faculty"}',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.primaryBlue),
                                ),
                                ElevatedButton.icon(
                                  onPressed: () => _joinLive(lc.streamUrl),
                                  icon: const Icon(Icons.videocam, size: 16),
                                  label: Text(isLive ? 'Join Live' : 'Open Link',
                                      style: const TextStyle(fontSize: 12)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isLive
                                        ? Colors.red
                                        : AppTheme.primaryBlue,
                                    foregroundColor:
                                        isLive ? Colors.white : AppTheme.primaryBlueDark,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
