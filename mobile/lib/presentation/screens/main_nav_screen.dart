import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'home/home_screen.dart';
import 'admin/admin_dashboard_screen.dart';
import 'teacher/teacher_dashboard_screen.dart';
import 'courses/courses_screen.dart';
import 'materials/materials_screen.dart';
import 'lectures/lectures_screen.dart';
import 'live/live_screen.dart';
import 'tests/tests_screen.dart';
import 'profile/profile_screen.dart';

class MainNavScreen extends ConsumerStatefulWidget {
  const MainNavScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends ConsumerState<MainNavScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final role = authState.user?.role?.toUpperCase() ?? 'STUDENT';

    final List<Widget> screens;
    final List<BottomNavigationBarItem> navItems;

    if (role == 'ADMIN') {
      screens = const [
        AdminDashboardScreen(),
        CoursesScreen(),
        MaterialsScreen(),
        LiveScreen(),
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.admin_panel_settings_outlined),
          activeIcon: Icon(Icons.admin_panel_settings_rounded),
          label: 'Admin Hub',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.layers_outlined),
          activeIcon: Icon(Icons.layers_rounded),
          label: 'Batches',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.description_outlined),
          activeIcon: Icon(Icons.description_rounded),
          label: 'Materials',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.sensors_outlined),
          activeIcon: Icon(Icons.sensors_rounded),
          label: 'Live',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline_rounded),
          activeIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    } else if (role == 'TEACHER') {
      screens = const [
        TeacherDashboardScreen(),
        CoursesScreen(),
        LecturesScreen(),
        LiveScreen(),
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.school_outlined),
          activeIcon: Icon(Icons.school_rounded),
          label: 'Faculty',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.layers_outlined),
          activeIcon: Icon(Icons.layers_rounded),
          label: 'Batches',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.play_circle_outline_rounded),
          activeIcon: Icon(Icons.play_circle_filled_rounded),
          label: 'Lectures',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.sensors_outlined),
          activeIcon: Icon(Icons.sensors_rounded),
          label: 'Live',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline_rounded),
          activeIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    } else {
      screens = const [
        HomeScreen(),
        CoursesScreen(),
        LiveScreen(),
        TestsScreen(),
        ProfileScreen(),
      ];
      navItems = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home_rounded),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.book_outlined),
          activeIcon: Icon(Icons.book_rounded),
          label: 'Courses',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.sensors_outlined),
          activeIcon: Icon(Icons.sensors_rounded),
          label: 'Live',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment_outlined),
          activeIcon: Icon(Icons.assignment_rounded),
          label: 'Tests',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline_rounded),
          activeIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    }

    if (_currentIndex >= screens.length) {
      _currentIndex = 0;
    }

    final activeColor = role == 'ADMIN'
        ? const Color(0xFFDC2626)
        : role == 'TEACHER'
            ? const Color(0xFF7C3AED)
            : AppTheme.primaryBlue;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: screens,
        ),
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            backgroundColor: Colors.white,
            selectedItemColor: activeColor,
            unselectedItemColor: const Color(0xFF94A3B8),
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
            unselectedLabelStyle: const TextStyle(fontSize: 11),
            items: navItems,
          ),
        ),
      ),
    );
  }
}
