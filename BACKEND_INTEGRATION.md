# EngApp Backend Integration Guide

This file is for the UI-building AI. It explains exactly how to connect the design/UI to the backend.

## What this app is
A vocabulary app for Traditional Chinese speakers. Users swipe through English words, see an illustration, translation, definitions, and can mark words known or bookmark them.

## Core idea
The UI should treat the API as the source of truth for:
- words shown in feed
- word detail screens
- user profile/settings
- bookmarks
- known words
- streak / progress stats
- generated images

## Important concept: a word card
A single word item returned by the API contains:
- word text
- pronunciation fields
- syllable count
- English definition
- example sentence
- CEFR level
- tags
- source lists
- frequency rank
- translation(s)
- description(s)
- image(s)

If a field is missing or null, the UI should hide that section.

## Data shape returned by `/api/words/feed` and `/api/words/:id`

```json
{
  "id": 1247,
  "word": "solitude",
  "phoneticsIpa": "/ˈsɒlɪtjuːd/",
  "phoneticsKk": "[ˋsɑlɪˏtjud]",
  "syllableCount": 3,
  "definitionEn": "The state of being alone, especially when peaceful or chosen.",
  "exampleSentence": "She found a strange solitude in walking the empty beach at dawn.",
  "cefrLevel": "B1",
  "themeTags": ["loneliness", "reflection"],
  "examTags": ["IELTS"],
  "sourceLists": ["NGSL", "CEFR-J"],
  "frequencyRank": 1247,
  "translation": "孤獨",
  "translations": {
    "zh-TW": "孤獨",
    "zh-HK": "孤獨",
    "ja": "孤独"
  },
  "descriptions": [
    {
      "languageCode": "zh-TW",
      "tone": "neutral",
      "text": "一種主動選擇、帶有平靜感的獨處狀態。"
    }
  ],
  "primaryImage": {
    "styleId": 1,
    "styleSlug": "warm-cinematic",
    "styleName": "Warm Cinematic",
    "isFree": true,
    "imageUrl": "/api/images/1247_1_1715300000000.png",
    "width": 832,
    "height": 1248
  },
  "images": []
}
```

## API endpoints

### Public
- `GET /api/healthz`
- `GET /api/words/styles/list`
- `GET /api/words/feed`
- `GET /api/words/:id`
- `GET /api/images/:filename`

### User-scoped
Requires either:
- `X-Device-Id: <stable device id>`
- or `Authorization: Bearer <jwt>` later

Endpoints:
- `GET /api/user/me`
- `PATCH /api/user/me`
- `POST /api/user/bookmarks`
- `DELETE /api/user/bookmarks/:wordId`
- `GET /api/user/bookmarks`
- `POST /api/user/known`
- `GET /api/user/known`
- `GET /api/user/revisit`
- `POST /api/user/seen`
- `GET /api/user/stats`

## What each screen should call

### App start
1. create/load device id
2. `GET /api/user/me`
3. `GET /api/words/styles/list`
4. `GET /api/words/feed?limit=10`

### Feed
- show one card at a time
- call `POST /api/user/seen` when a card is viewed
- call `POST /api/user/known` when user marks it learned
- call `POST /api/user/bookmarks` or `DELETE /api/user/bookmarks/:wordId` when bookmarked/unbookmarked
- call `GET /api/words/feed` again when the deck is nearly empty

### Detail page
- either reuse the feed object or call `GET /api/words/:id`
- show translations, descriptions, images, tags, example sentence

### Stats page
- call `GET /api/user/stats`

### Bookmarks page
- call `GET /api/user/bookmarks`
- then fetch each word by id with `GET /api/words/:id`

## UI rules
- If `primaryImage` is null, show a placeholder
- If `cefrLevel` is null, hide the badge
- If `translations` has only zh-TW, hide other language rows
- If `descriptions` is empty, hide the description section
- If `images` has premium styles only, do not show them to free users

## Image loading rule
The image URL is relative. Use it by prefixing your API base URL.
Example:
- `/api/images/abc.png`
- becomes `https://your-domain.com/api/images/abc.png`

## User states the UI should support
- guest user
- returning user
- empty feed
- image not ready
- known word
- bookmarked word
- all words seen
- offline / retry

## What the backend already supports
- guest device-id user creation
- user preferences
- feed lookup
- known/bookmark/seen tracking
- stats and streaks
- generated images from object storage

## What the UI should not assume
- feed order is not fixed yet
- share card backend is not the main path yet
- exam preset endpoint is not a dedicated backend route yet

## Server-side setup needed
If you are the project owner, make sure these exist:
- `DATABASE_URL`
- `ADMIN_API_KEY`
- `NVIDIA_API_KEY`
- object storage env vars
- `PORT`

Also remember:
- restart API workflow after backend code changes
- keep CORS aligned with production later
- Clerk verification is still future work

## Files that matter
- `artifacts/api-server/src/routes/words.ts`
- `artifacts/api-server/src/routes/user.ts`
- `artifacts/api-server/src/routes/admin.ts`
- `lib/db/src/schema/words.ts`
- `lib/db/src/schema/userActivity.ts`
- `lib/db/src/schema/users.ts`
- `lib/db/src/schema/wordContent.ts`
