import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../data/models/admin_stats_model.dart';
import '../../data/models/user_directory_model.dart';
import 'auth_provider.dart';

final adminStatsProvider = FutureProvider.autoDispose<AdminStatsModel>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get(ApiConstants.adminStats);

  if (res.data['success'] == true && res.data['data'] != null) {
    return AdminStatsModel.fromJson(res.data['data']);
  }
  return AdminStatsModel(counts: AdminStatsCounts());
});

final adminTeachersProvider = FutureProvider.autoDispose<List<AdminFacultyModel>>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get(ApiConstants.adminTeachers);

  if (res.data['success'] == true && res.data['data'] != null) {
    return (res.data['data'] as List)
        .map((t) => AdminFacultyModel.fromJson(t))
        .toList();
  }
  return [];
});

final adminStudentsProvider = FutureProvider.autoDispose<List<AdminStudentModel>>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get(ApiConstants.adminStudents);

  if (res.data['success'] == true && res.data['data'] != null) {
    return (res.data['data'] as List)
        .map((s) => AdminStudentModel.fromJson(s))
        .toList();
  }
  return [];
});
