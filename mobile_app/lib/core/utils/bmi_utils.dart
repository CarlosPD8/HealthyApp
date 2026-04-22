class BmiUtils {
  static double? calculate(double weight, double heightRaw) {
    final heightMeters = heightRaw >= 3 ? heightRaw / 100 : heightRaw;
    if (heightMeters <= 0) return null;
    return weight / (heightMeters * heightMeters);
  }
}
