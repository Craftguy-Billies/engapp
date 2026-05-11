// Data classes mirroring the backend response shape documented in
// BACKEND_INTEGRATION.md. Every field can be null — the UI must hide
// sections gracefully.

class WordImage {
  final int? styleId;
  final String? styleSlug;
  final String? styleName;
  final bool isFree;
  final String imageUrl;
  final int? width;
  final int? height;

  const WordImage({
    this.styleId,
    this.styleSlug,
    this.styleName,
    this.isFree = true,
    required this.imageUrl,
    this.width,
    this.height,
  });

  factory WordImage.fromJson(Map<String, dynamic> j) => WordImage(
        styleId: j['styleId'] as int?,
        styleSlug: j['styleSlug'] as String?,
        styleName: j['styleName'] as String?,
        isFree: j['isFree'] as bool? ?? true,
        imageUrl: j['imageUrl'] as String? ?? '',
        width: j['width'] as int?,
        height: j['height'] as int?,
      );
}

class WordDescription {
  final String languageCode;
  final String tone;
  final String text;

  const WordDescription({
    required this.languageCode,
    required this.tone,
    required this.text,
  });

  factory WordDescription.fromJson(Map<String, dynamic> j) => WordDescription(
        languageCode: j['languageCode'] as String? ?? 'zh-TW',
        tone: j['tone'] as String? ?? 'neutral',
        text: j['text'] as String? ?? '',
      );
}

class WordCardData {
  final int id;
  final String word;
  final String? pos;
  final String? phoneticsIpa;
  final String? phoneticsKk;
  final int? syllableCount;
  final String? definitionEn;
  final String? exampleSentence;
  final String? cefrLevel;
  final List<String> themeTags;
  final List<String> examTags;
  final List<String> sourceLists;
  final int? frequencyRank;
  final String? translation;
  final Map<String, String> translations;
  final List<WordDescription> descriptions;
  final WordImage? primaryImage;
  final List<WordImage> images;

  const WordCardData({
    required this.id,
    required this.word,
    this.pos,
    this.phoneticsIpa,
    this.phoneticsKk,
    this.syllableCount,
    this.definitionEn,
    this.exampleSentence,
    this.cefrLevel,
    this.themeTags = const [],
    this.examTags = const [],
    this.sourceLists = const [],
    this.frequencyRank,
    this.translation,
    this.translations = const {},
    this.descriptions = const [],
    this.primaryImage,
    this.images = const [],
  });

  factory WordCardData.fromJson(Map<String, dynamic> j) {
    return WordCardData(
      id: (j['id'] as num).toInt(),
      word: j['word'] as String? ?? '',
      pos: j['pos'] as String?,
      phoneticsIpa: j['phoneticsIpa'] as String?,
      phoneticsKk: j['phoneticsKk'] as String?,
      syllableCount: j['syllableCount'] as int?,
      definitionEn: j['definitionEn'] as String?,
      exampleSentence: j['exampleSentence'] as String?,
      cefrLevel: j['cefrLevel'] as String?,
      themeTags: ((j['themeTags'] as List?) ?? []).map((e) => e.toString()).toList(),
      examTags: ((j['examTags'] as List?) ?? []).map((e) => e.toString()).toList(),
      sourceLists: ((j['sourceLists'] as List?) ?? []).map((e) => e.toString()).toList(),
      frequencyRank: j['frequencyRank'] as int?,
      translation: j['translation'] as String?,
      translations: ((j['translations'] as Map?) ?? {}).map(
        (k, v) => MapEntry(k.toString(), v.toString()),
      ),
      descriptions: ((j['descriptions'] as List?) ?? [])
          .map((e) => WordDescription.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryImage: j['primaryImage'] != null
          ? WordImage.fromJson(j['primaryImage'] as Map<String, dynamic>)
          : null,
      images: ((j['images'] as List?) ?? [])
          .map((e) => WordImage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
