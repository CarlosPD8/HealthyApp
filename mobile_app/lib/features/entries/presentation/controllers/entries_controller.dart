import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/app_exception.dart';
import '../../../../data/models/entry_model.dart';
import '../../../../data/repositories/entries_repository.dart';

class EntriesState {
  const EntriesState({
    this.entries = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
  });

  final List<EntryModel> entries;
  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;

  EntriesState copyWith({
    List<EntryModel>? entries,
    bool? isLoading,
    bool? isSubmitting,
    String? errorMessage,
    bool clearError = false,
  }) {
    return EntriesState(
      entries: entries ?? this.entries,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

class EntriesController extends StateNotifier<EntriesState> {
  EntriesController(this._repository) : super(const EntriesState());

  final EntriesRepository _repository;

  Future<void> loadEntries() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final entries = await _repository.fetchEntries();
      state = state.copyWith(entries: entries, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            e is AppException ? e.message : 'No se pudo cargar el historial.',
      );
    }
  }

  Future<bool> addEntry({
    required double weight,
    required double height,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final entry = await _repository.createEntry(
        weight: weight,
        height: height,
      );
      final updated = [...state.entries, entry]
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      state = state.copyWith(entries: updated, isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage:
            e is AppException ? e.message : 'No se pudo guardar la entrada.',
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}
