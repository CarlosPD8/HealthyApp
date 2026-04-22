import '../../core/constants/api_constants.dart';
import '../models/entry_model.dart';
import '../services/api_client.dart';

class EntriesRepository {
  const EntriesRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<EntryModel>> fetchEntries() async {
    final response = await _apiClient.get(ApiConstants.entries);
    final list =
        (response.data as List<dynamic>)
            .map((item) => EntryModel.fromJson(item as Map<String, dynamic>))
            .toList();

    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<EntryModel> createEntry({
    required double weight,
    required double height,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.entries,
      data: {'weight': weight, 'height': height},
    );

    return EntryModel.fromJson(response.data as Map<String, dynamic>);
  }
}
