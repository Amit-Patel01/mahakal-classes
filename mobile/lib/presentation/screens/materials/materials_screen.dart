import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/academic_models.dart';
import '../../providers/auth_provider.dart';

class MaterialsScreen extends ConsumerStatefulWidget {
  const MaterialsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MaterialsScreen> createState() => _MaterialsScreenState();
}

class _MaterialsScreenState extends ConsumerState<MaterialsScreen> {
  List<MaterialModel> _materials = [];
  String _selectedCategory = '';
  bool _loading = true;

  final List<Map<String, String>> _categories = [
    {'label': 'All', 'value': ''},
    {'label': 'Notes', 'value': 'NOTES'},
    {'label': 'PYQ Papers', 'value': 'PREVIOUS_YEAR'},
    {'label': 'Assignments', 'value': 'ASSIGNMENT'},
    {'label': 'Syllabus', 'value': 'SYLLABUS'},
    {'label': 'Important Qs', 'value': 'IMPORTANT_QUESTION'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchMaterials();
  }

  Future<void> _fetchMaterials() async {
    setState(() => _loading = true);
    final client = ref.read(apiClientProvider);

    try {
      final query = _selectedCategory.isNotEmpty ? {'category': _selectedCategory} : null;
      final res = await client.get(ApiConstants.materials, queryParameters: query);

      if (res.data['success'] == true && res.data['data'] != null) {
        setState(() {
          _materials = (res.data['data'] as List)
              .map((m) => MaterialModel.fromJson(m))
              .toList();
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  void _downloadFile(String fileId) async {
    final url = Uri.parse(ApiConstants.downloadUrl(fileId));
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not initiate file download from GridFS.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('HE Study Material'),
      ),
      body: Column(
        children: [
          // Category horizontal pills
          Container(
            height: 52,
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat['value'];

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat['label']!),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat['value']!);
                      _fetchMaterials();
                    },
                    selectedColor: AppTheme.primaryBlue,
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppTheme.primaryBlueDark : const Color(0xFF64748B),
                    ),
                  ),
                );
              },
            ),
          ),

          // Material list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _materials.isEmpty
                    ? const Center(
                        child: Text(
                          'No materials found for this category.',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _materials.length,
                        itemBuilder: (context, index) {
                          final item = _materials[index];

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
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
                                          color: Colors.blue.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          item.category.replaceAll('_', ' '),
                                          style: const TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.blue,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '${(item.fileSize / 1024 / 1024).toStringAsFixed(1)} MB',
                                        style: const TextStyle(
                                            fontSize: 11, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    item.title,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryBlueDark,
                                    ),
                                  ),
                                  if (item.description.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      item.description,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                          fontSize: 12, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                  const SizedBox(height: 14),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        item.courseTitle ?? 'Mahakal Classes',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: AppTheme.primaryBlueDark),
                                      ),
                                      ElevatedButton.icon(
                                        onPressed: () => _downloadFile(item.fileId),
                                        icon: const Icon(Icons.download, size: 16),
                                        label: const Text('Download PDF', style: TextStyle(fontSize: 11)),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppTheme.primaryBlueDark,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 14, vertical: 8),
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
          ),
        ],
      ),
    );
  }
}
