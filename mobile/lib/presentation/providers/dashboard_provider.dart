import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';
import '../../core/constants/api_constants.dart';
import '../../data/models/academic_models.dart';
import '../../data/models/test_model.dart';

class DashboardData {
  final LiveClassModel? activeLive;
  final List<CourseModel> courses;
  final List<MaterialModel> materials;
  final List<TestModel> tests;
  final bool isLoading;

  DashboardData({
    this.activeLive,
    this.courses = const [],
    this.materials = const [],
    this.tests = const [],
    this.isLoading = true,
  });
}

final dashboardProvider = FutureProvider.autoDispose<DashboardData>((ref) async {
  final client = ref.watch(apiClientProvider);

  LiveClassModel? activeLive;
  List<CourseModel> courses = [];
  List<MaterialModel> materials = [];
  List<TestModel> tests = [];

  try {
    final liveRes = await client.get(ApiConstants.activeLive);
    if (liveRes.data['success'] == true && liveRes.data['data'] != null) {
      activeLive = LiveClassModel.fromJson(liveRes.data['data']);
    }
  } catch (_) {}

  try {
    final courseRes = await client.get(ApiConstants.courses);
    if (courseRes.data['success'] == true && courseRes.data['data'] != null) {
      courses = (courseRes.data['data'] as List)
          .map((c) => CourseModel.fromJson(c))
          .toList();
    }
  } catch (_) {}

  try {
    final matRes = await client.get(ApiConstants.materials);
    if (matRes.data['success'] == true && matRes.data['data'] != null) {
      materials = (matRes.data['data'] as List)
          .map((m) => MaterialModel.fromJson(m))
          .toList();
    }
  } catch (_) {}

  try {
    final testRes = await client.get(ApiConstants.tests);
    if (testRes.data['success'] == true && testRes.data['data'] != null) {
      tests = (testRes.data['data'] as List)
          .map((t) => TestModel.fromJson(t))
          .toList();
    }
  } catch (_) {}

  return DashboardData(
    activeLive: activeLive,
    courses: courses,
    materials: materials,
    tests: tests,
    isLoading: false,
  );
});
