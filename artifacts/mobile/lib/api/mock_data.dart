// Mock dataset used when the backend isn't reachable.
//
// Mirrors artifacts/mockup-sandbox/src/components/mockups/engapp/_lib/mock.ts.
// The user said: "for datasets and some parts, its still not yet finish. keep
// it for some default values or placeholders". This is that placeholder.

import '../models/style.dart';
import '../models/word.dart';

const String _solitudeImg =
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=900';
const String _ephemeralImg =
    'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=900';
const String _serendipityImg =
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900';
const String _lingerImg =
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900';
const String _candidImg =
    'https://images.unsplash.com/photo-1496950866446-3253e1470e8e?w=900';
const String _resilientImg =
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900';

List<IllustrationStyle> mockStyles() => const [
      IllustrationStyle(
        id: 1,
        slug: 'warm-cinematic',
        name: 'Warm Cinematic',
        subtitle: 'Sunset-toned, photographic mood',
        isFree: true,
      ),
      IllustrationStyle(
        id: 2,
        slug: 'scrapbook-tw',
        name: '小紅書 Scrapbook',
        subtitle: 'Sticker-collage, soft pastel',
        isFree: true,
      ),
      IllustrationStyle(
        id: 3,
        slug: 'kraft',
        name: 'Kraft Paper',
        subtitle: 'Tactile, hand-drawn warmth',
        isFree: true,
      ),
      IllustrationStyle(
        id: 4,
        slug: 'threads',
        name: 'Threads Editorial',
        subtitle: 'Minimal, monochrome, magazine layout',
        isFree: false,
      ),
      IllustrationStyle(
        id: 5,
        slug: 'ink-wash',
        name: '水墨 Ink Wash',
        subtitle: 'East-Asian ink, tonal greys',
        isFree: false,
      ),
      IllustrationStyle(
        id: 6,
        slug: 'neon',
        name: 'Neon Street',
        subtitle: 'Night-market neon, high contrast',
        isFree: false,
      ),
    ];

WordCardData _mock({
  required int id,
  required String word,
  required String pos,
  required String ipa,
  required String kk,
  required int syl,
  required String def,
  required String example,
  required String cefr,
  required List<String> themes,
  required List<String> exams,
  required List<String> sources,
  required int rank,
  required Map<String, String> trans,
  required List<WordDescription> descs,
  required String image,
}) {
  return WordCardData(
    id: id,
    word: word,
    pos: pos,
    phoneticsIpa: ipa,
    phoneticsKk: kk,
    syllableCount: syl,
    definitionEn: def,
    exampleSentence: example,
    cefrLevel: cefr,
    themeTags: themes,
    examTags: exams,
    sourceLists: sources,
    frequencyRank: rank,
    translation: trans['zh-TW'],
    translations: trans,
    descriptions: descs,
    primaryImage: WordImage(
      styleId: 1,
      styleSlug: 'warm-cinematic',
      styleName: 'Warm Cinematic',
      isFree: true,
      imageUrl: image,
    ),
  );
}

List<WordCardData> mockWords() => [
      _mock(
        id: 1247,
        word: 'solitude',
        pos: 'n',
        ipa: '/ˈsɒlɪtjuːd/',
        kk: '[ˋsɑlɪˏtjud]',
        syl: 3,
        def: 'The state or quality of being alone, especially when peaceful or chosen.',
        example: 'She found a quiet solitude in the cabin by the lake.',
        cefr: 'B1',
        themes: ['loneliness', 'reflection', 'nature'],
        exams: ['IELTS'],
        sources: ['NGSL', 'CEFR-J'],
        rank: 1247,
        trans: const {'zh-TW': '孤獨', 'zh-HK': '孤獨', 'ja': '孤独'},
        descs: const [
          WordDescription(
            languageCode: 'zh-HK',
            tone: 'snarky',
            text: '一個人未必寂寞，但寂寞嘅人通常都係一個人。',
          ),
        ],
        image: _solitudeImg,
      ),
      _mock(
        id: 2031,
        word: 'ephemeral',
        pos: 'adj',
        ipa: '/ɪˈfem(ə)rəl/',
        kk: '[ɪˋfɛmərəl]',
        syl: 4,
        def: 'Lasting for a very short time.',
        example: 'The cherry blossoms are beautiful but ephemeral.',
        cefr: 'C1',
        themes: ['time', 'nature'],
        exams: ['TOEFL', 'IELTS'],
        sources: ['NAWL'],
        rank: 8412,
        trans: const {'zh-TW': '短暫的', 'ja': '儚い'},
        descs: const [
          WordDescription(
            languageCode: 'zh-TW',
            tone: 'neutral',
            text: '形容存在或維持時間極短的事物，如花期、流行、夢境。',
          ),
        ],
        image: _ephemeralImg,
      ),
      _mock(
        id: 3392,
        word: 'serendipity',
        pos: 'n',
        ipa: '/ˌsɛrənˈdɪpɪti/',
        kk: '[ˏsɛrənˋdɪpətɪ]',
        syl: 5,
        def: 'The occurrence of events by chance in a happy or beneficial way.',
        example: 'It was pure serendipity that we met at the bookstore.',
        cefr: 'C1',
        themes: ['love', 'chance'],
        exams: ['TOEFL'],
        sources: ['NAWL'],
        rank: 9912,
        trans: const {'zh-TW': '美麗的意外', 'zh-HK': '美麗的意外'},
        descs: const [
          WordDescription(
            languageCode: 'zh-TW',
            tone: 'soft',
            text: '一場毫無預期、卻剛剛好的好事——比命運溫柔，比運氣具體。',
          ),
        ],
        image: _serendipityImg,
      ),
      _mock(
        id: 4521,
        word: 'linger',
        pos: 'v',
        ipa: '/ˈlɪŋɡə/',
        kk: '[ˋlɪŋɡɚ]',
        syl: 2,
        def: 'To stay in a place longer than necessary.',
        example: 'The smell of rain lingered all afternoon.',
        cefr: 'B2',
        themes: ['time', 'feeling'],
        exams: ['IELTS'],
        sources: ['NGSL'],
        rank: 4521,
        trans: const {'zh-TW': '徘徊', 'ja': '長居する'},
        descs: const [],
        image: _lingerImg,
      ),
      _mock(
        id: 5288,
        word: 'candid',
        pos: 'adj',
        ipa: '/ˈkandɪd/',
        kk: '[ˋkændɪd]',
        syl: 2,
        def: 'Truthful and straightforward; frank.',
        example: 'She gave a candid account of her mistakes.',
        cefr: 'B2',
        themes: ['emotion', 'work'],
        exams: ['IELTS', 'TOEIC'],
        sources: ['NGSL'],
        rank: 5288,
        trans: const {'zh-TW': '坦率的'},
        descs: const [],
        image: _candidImg,
      ),
      _mock(
        id: 6105,
        word: 'resilient',
        pos: 'adj',
        ipa: '/rɪˈzɪlɪənt/',
        kk: '[rɪˋzɪlɪənt]',
        syl: 4,
        def: 'Able to recover quickly from difficulties; tough.',
        example: 'Children are remarkably resilient after setbacks.',
        cefr: 'B2',
        themes: ['emotion', 'work', 'family'],
        exams: ['TOEFL', 'IELTS'],
        sources: ['NAWL', 'CEFR-J'],
        rank: 6105,
        trans: const {'zh-TW': '有韌性的', 'ja': '回復力のある'},
        descs: const [
          WordDescription(
            languageCode: 'zh-HK',
            tone: 'snarky',
            text: '彈得返起，係實力，唔係幸運。',
          ),
        ],
        image: _resilientImg,
      ),
    ];
