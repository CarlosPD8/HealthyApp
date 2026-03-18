class EntryModel {
  const EntryModel({
    required this.id,
    required this.weight,
    required this.height,
    required this.createdAt,
  });

  final int id;
  final double weight;
  final double height;
  final DateTime createdAt;

  factory EntryModel.fromJson(Map<String, dynamic> json) {
    return EntryModel(
      id: (json['id'] as num).toInt(),
      weight: (json['weight'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
