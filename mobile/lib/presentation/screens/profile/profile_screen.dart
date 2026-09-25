import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final role = user?.role?.toUpperCase() ?? 'STUDENT';
    final isAdmin = role == 'ADMIN';
    final isTeacher = role == 'TEACHER';

    final roleLabel = isAdmin
        ? 'SYSTEM ADMINISTRATOR'
        : isTeacher
            ? 'ACADEMIC FACULTY'
            : 'ENROLLED STUDENT';

    final roleBadgeColor = isAdmin
        ? const Color(0xFFDC2626)
        : isTeacher
            ? const Color(0xFF7C3AED)
            : AppTheme.primaryBlue;

    final screenTitle = isAdmin
        ? 'Admin Profile'
        : isTeacher
            ? 'Faculty Profile'
            : 'Student Profile';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(screenTitle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: roleBadgeColor.withOpacity(0.12),
                      border: Border.all(color: roleBadgeColor, width: 2.5),
                    ),
                    child: Center(
                      child: Text(
                        user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'U',
                        style: TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: roleBadgeColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    user?.name ?? 'User',
                    style: const TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryBlueDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: roleBadgeColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: roleBadgeColor.withOpacity(0.3)),
                    ),
                    child: Text(
                      roleLabel,
                      style: TextStyle(
                        color: roleBadgeColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Profile info tiles
            _infoTile(Icons.phone_outlined, 'Registered Mobile', user?.mobile.isNotEmpty == true ? user!.mobile : 'N/A'),
            
            if (isAdmin) ...[
              _infoTile(Icons.admin_panel_settings_outlined, 'Access Privileges', 'Super Administrator & Institutional Control'),
              _infoTile(Icons.analytics_outlined, 'Scope', 'Curriculum, Faculty, Students, Live & CBT System'),
            ] else if (isTeacher) ...[
              _infoTile(Icons.school_outlined, 'Faculty Designation', 'Senior Academic Educator'),
              _infoTile(Icons.class_outlined, 'Academic Department', 'Instruction, Video Lectures & Assessment'),
            ] else ...[
              _infoTile(Icons.badge_outlined, 'Enrollment Number', user?.enrollmentNumber ?? 'MC2026-REG'),
              _infoTile(Icons.flag_outlined, 'Academic Goal', user?.academicGoal ?? 'Top Rank in JEE / NEET'),
            ],

            _infoTile(Icons.business_outlined, 'Institution', 'Mahakal Classes, Varanasi'),
            _infoTile(Icons.verified_user_outlined, 'Account Verification', 'Active & Verified Account'),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                icon: const Icon(Icons.logout_rounded, color: Colors.red),
                label: const Text(
                  'Sign Out',
                  style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(IconData icon, String title, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryBlueDark, size: 20),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryBlueDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
