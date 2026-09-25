class ApiConstants {
  // Local machine Wi-Fi IPv4 address running Node.js backend on port 5000
  // Reachable by both physical Android/iOS devices on the same Wi-Fi and emulators:
  static const String hostIp = '192.168.1.7';
  static const String port = '5000';
  static const String baseUrl = 'http://$hostIp:$port/api/v1';

  // Alternative for standard Android Studio Emulator localhost loopback:
  // static const String baseUrl = 'http://10.0.2.2:5000/api/v1';

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String getMe = '/auth/me';
  static const String profile = '/auth/profile';

  // Academic Endpoints
  static const String courses = '/courses';
  static const String materials = '/materials';
  static const String lectures = '/lectures';
  static const String liveClasses = '/live-classes';
  static const String activeLive = '/live-classes/active';

  // Admin Endpoints
  static const String adminStats = '/admin/stats';
  static const String adminStudents = '/admin/students';
  static const String adminTeachers = '/admin/teachers';

  // Examination Endpoints
  static const String tests = '/tests';
  static const String startAttempt = '/tests'; // + /:testId/start
  static const String submitAttempt = '/tests/attempts'; // + /:attemptId/submit
  static const String studentResults = '/results/student';
  static const String analytics = '/results/analytics';

  // Media & Gallery Endpoints
  static const String gallery = '/gallery';
  static const String announcements = '/announcements';

  // MongoDB GridFS Streaming URLs
  static String streamUrl(String fileId) => '$baseUrl/files/stream/$fileId';
  static String downloadUrl(String fileId) => '$baseUrl/files/$fileId';
}
