class IllustrationStyle {
  final int id;
  final String slug;
  final String name;
  final String? subtitle;
  final bool isFree;
  final String? sampleImageUrl;

  const IllustrationStyle({
    required this.id,
    required this.slug,
    required this.name,
    this.subtitle,
    this.isFree = true,
    this.sampleImageUrl,
  });

  factory IllustrationStyle.fromJson(Map<String, dynamic> j) {
    return IllustrationStyle(
      id: (j['id'] as num).toInt(),
      slug: j['slug'] as String? ?? '',
      name: j['name'] as String? ?? '',
      subtitle: j['subtitle'] as String?,
      isFree: j['isFree'] as bool? ?? true,
      sampleImageUrl: j['sampleImageUrl'] as String?,
    );
  }
}
