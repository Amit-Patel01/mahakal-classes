import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/constants/api_constants.dart';
import '../../data/models/user_model.dart';

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? errorMessage;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.isLoading = false,
    this.errorMessage,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? errorMessage,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _client;

  AuthNotifier(this._client) : super(AuthState()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final token = await SecureStorage.getAccessToken();
    final cachedUser = await SecureStorage.getUserData();

    if (token != null && cachedUser != null) {
      try {
        final user = UserModel.fromJson(jsonDecode(cachedUser));
        state = state.copyWith(user: user, isAuthenticated: true);
      } catch (e) {
        await SecureStorage.clearAll();
      }
    }
  }

  Future<bool> login(String identifier, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _client.post(
        ApiConstants.login,
        data: {'identifier': identifier, 'password': password},
      );

      final data = response.data;
      if (data['success'] == true && data['data'] != null) {
        final token = data['data']['accessToken'];
        final refreshToken = data['data']['refreshToken'];
        final user = UserModel.fromJson(data['data']['user']);

        await SecureStorage.saveTokens(
          accessToken: token,
          refreshToken: refreshToken,
        );
        await SecureStorage.saveUserData(jsonEncode(user.toJson()));

        state = state.copyWith(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: data['message'] ?? 'Login failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Network error. Please ensure backend server is reachable.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await SecureStorage.clearAll();
    state = AuthState();
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthNotifier(client);
});
