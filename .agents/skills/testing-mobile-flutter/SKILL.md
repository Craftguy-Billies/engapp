---
name: testing-mobile-flutter
description: Test the Flutter EngApp UI under artifacts/mobile/ end-to-end on Chrome. Use when verifying gesture, navigation, or visual changes in the Flutter app — especially swipe / drag behaviour on the Feed card.
---

# testing-mobile-flutter

The Flutter app lives at `artifacts/mobile/`. iOS/Android sims are not available on the Linux Devin box, so test on Flutter web in Chrome — the Dart gesture pipeline is the same code path for all targets.

## Environment

- Flutter SDK is pre-installed at `~/flutter`. Add to PATH each shell:
  ```bash
  export PATH="$HOME/flutter/bin:$PATH"
  ```
- No backend / DB needed. The app falls back to mock data when `ENGAPP_API_BASE` is unset.
- No secrets needed for UI testing.

## Build & serve

```bash
export PATH="$HOME/flutter/bin:$PATH"
cd ~/repos/engapp/artifacts/mobile
flutter analyze              # should be clean
flutter build web --release  # outputs build/web/
cd build/web && python3 -m http.server 5151
```

Open `http://localhost:5151/` in Chrome (already running on the desktop).

## Where things live

- `lib/widgets/word_card.dart` — Feed card + swipe gesture detection. Thresholds: 60px distance OR 320 px/s velocity; dominant axis (horizontal vs vertical) wins.
- `lib/pages/feed_page.dart` — owns the deck index and the `_advance(action, wordId)` callback. `bookmark` does NOT advance; `known` / `skip` advance.
- `lib/app.dart` — in-memory router. Feed does NOT route to `WordDetailPage` on tap (that was removed by user request); detail is reachable only from Bookmarks/Known/Revisit/Search rows.
- `lib/api/mock_data.dart` — placeholder word list used when no backend is reachable.

## Testing swipe gestures in Chrome

Use `mouse_move` → `left_mouse_down` (no coordinate) → several `mouse_move`s to simulate velocity → `left_mouse_up`. Do **not** use `left_click_drag` — it fires too fast for Flutter's gesture arena to register direction reliably.

Example swipe right at card centre (~512, 370):
```
mouse_move [400, 370]
left_mouse_down
mouse_move [450, 370]
mouse_move [520, 370]
mouse_move [600, 370]
mouse_move [700, 370]
left_mouse_up
```

Distance ~300px in ~5 events is comfortably above the 60px threshold and produces enough velocity.

Expected outcomes:
- Right → heart icon at bottom-right fills (lime), card recentres, deck does NOT advance.
- Up → `KNOWN` hint badge briefly, deck advances.
- Left → `SKIP` hint badge briefly, deck advances.
- Down → `SKIP` (same as left).
- Tap on image area → nothing (NO Word Detail page should push in).

## Common gotchas

- `left_mouse_down` and `left_mouse_up` do NOT accept `coordinate`. Move the cursor first with `mouse_move`, then press/release at the current position.
- Flutter web stores user state in IndexedDB. To force a fresh onboarding flow, clear site data for `localhost:5151` in Chrome devtools → Application → Storage.
- The `Gesture: System gesture gate timed out` error reported on iOS is an iOS-system issue (OS intercepting an edge gesture before Flutter sees it), not a Flutter bug. It manifests near the simulator's screen edges. Lower gesture thresholds in `word_card.dart` mitigate but cannot fully fix it; the workaround on iOS is to start the swipe away from the screen edges.
- The on-card action bar is part of the Word Card widget itself. Buttons there call the same `SwipeAction.known` / `SwipeAction.bookmark` path as swipes so the store / optimistic-UI flow is identical.

## Recording

For swipe-test recordings, maximise the browser window first:
```bash
sudo apt-get install -y wmctrl 2>/dev/null
wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
```
Then use `recording_start` → `annotate_recording` (test_start / assertion) for every test.

## Devin Secrets Needed

None. The app uses mock data with no backend.
