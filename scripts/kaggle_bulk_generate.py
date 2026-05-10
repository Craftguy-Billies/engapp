"""
Overnight bulk vocabulary generator for the English Vocab App.

WHAT IT DOES
  Reads data/processed/word-universe.csv and asks your Replit API to generate
  one full word card per row (LLM content + Flux illustrations for the chosen
  styles). Designed to run AFK on Kaggle for hours without supervision.

USAGE (Kaggle)
  1. Upload word-universe.csv as a Kaggle dataset input. Note its path.
  2. Add Kaggle secrets:
       REPLIT_API_BASE  -> e.g. https://abcd1234.your-repl.replit.dev
       ADMIN_API_KEY    -> the same value as your Replit ADMIN_API_KEY secret
  3. Adjust the CONFIG block below if you want a different slice.
  4. Run. Re-run anytime to resume — done words are skipped on both sides.

SAFETY
  * Infinite retry on 429 / 5xx / network errors, exponential backoff capped at
    MAX_BACKOFF seconds. Never crashes on a single word.
  * Per-request work — finest grained recovery. One bad word never blocks others.
  * Local checkpoint file (done.txt) survives kernel restarts.
  * Hard request timeout so a hung HTTP call cannot stall a worker forever.
  * SIGINT handler flushes the checkpoint before exit.
"""

from __future__ import annotations

import csv
import json
import os
import random
import signal
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Optional

# =============================================================================
# CONFIG — tweak these
# =============================================================================
API_BASE = os.environ.get("REPLIT_API_BASE", "").rstrip("/")
ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")
INPUT_CSV = os.environ.get(
    "INPUT_CSV", "/kaggle/input/word-universe/word-universe.csv"
)
CHECKPOINT_FILE = os.environ.get("CHECKPOINT_FILE", "/kaggle/working/done.txt")
ERROR_LOG_FILE = os.environ.get("ERROR_LOG_FILE", "/kaggle/working/errors.log")

# Which slice of the universe to process this run.
CEFR_FILTER: set[str] = {"A1", "A2"}  # empty set() = no filter, take all levels
SOURCE_FILTER: set[str] = set()       # e.g. {"NGSL", "TSL"} or empty = all
MAX_WORDS = 1000                      # 0 = no cap
CONCURRENCY = 4                       # parallel HTTP workers
STYLES = ["warm-cinematic", "watercolor-storybook"]   # free styles only

REQUEST_TIMEOUT = 240                 # seconds per /generate-batch call
MAX_BACKOFF = 300                     # cap retry wait at 5 min
# =============================================================================

if not API_BASE or not ADMIN_KEY:
    sys.exit("FATAL: set REPLIT_API_BASE and ADMIN_API_KEY environment variables.")

print_lock = threading.Lock()
checkpoint_lock = threading.Lock()


def log(msg: str) -> None:
    with print_lock:
        print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def log_error(word: str, msg: str) -> None:
    with checkpoint_lock:
        with open(ERROR_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')}\t{word}\t{msg}\n")


def append_done(word: str) -> None:
    with checkpoint_lock:
        with open(CHECKPOINT_FILE, "a", encoding="utf-8") as f:
            f.write(word + "\n")


def load_done() -> set[str]:
    if not os.path.exists(CHECKPOINT_FILE):
        return set()
    with open(CHECKPOINT_FILE, encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


def load_candidates() -> list[dict[str, Any]]:
    done = load_done()
    out: list[dict[str, Any]] = []
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            word = (row.get("word") or "").strip().lower()
            if not word or word in done:
                continue
            cefr = (row.get("cefr_level") or "").strip()
            if CEFR_FILTER and cefr not in CEFR_FILTER:
                continue
            sources = [
                s for s in (row.get("source_lists") or "").split("|") if s.strip()
            ]
            if SOURCE_FILTER and not (set(sources) & SOURCE_FILTER):
                continue
            rank_raw = (row.get("frequency_rank") or "").strip()
            try:
                rank = int(rank_raw) if rank_raw else None
            except ValueError:
                rank = None
            out.append(
                {
                    "word": word,
                    "cefr": cefr or None,
                    "sources": sources,
                    "rank": rank,
                }
            )
    # frequency rank ascending, unranked last
    out.sort(key=lambda c: (c["rank"] is None, c["rank"] or 0, c["word"]))
    if MAX_WORDS:
        out = out[:MAX_WORDS]
    return out


def post_generate(word_meta: dict[str, Any]) -> dict[str, Any]:
    """Hit /api/admin/words/generate-batch with a single word + metadata.
    Retries forever on transient errors."""
    payload = {
        "wordsMeta": [
            {
                "word": word_meta["word"],
                "sourceLists": word_meta["sources"],
                **(
                    {"frequencyRank": word_meta["rank"]}
                    if word_meta["rank"] is not None
                    else {}
                ),
                **({"cefrHint": word_meta["cefr"]} if word_meta["cefr"] else {}),
            }
        ],
        "styleSlugs": STYLES,
        "skipExisting": True,
    }
    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
        "Accept": "application/json",
    }
    url = f"{API_BASE}/api/admin/words/generate-batch"

    attempt = 0
    while True:
        attempt += 1
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                raw = resp.read().decode("utf-8")
                data = json.loads(raw)
                # Server may report per-word error inside a 200 response
                results = data.get("results") or []
                if results and results[0].get("status") == "error":
                    err_msg = results[0].get("error", "unknown error")
                    # Treat hard validation/parse errors as terminal for this word
                    if any(
                        k in err_msg.lower()
                        for k in ("invalid json", "missing field", "validation")
                    ):
                        raise TerminalWordError(err_msg)
                    raise TransientError(f"server reported error: {err_msg}")
                return data
        except TerminalWordError:
            raise
        except urllib.error.HTTPError as e:
            status = e.code
            if status == 401 or status == 403:
                raise TerminalWordError(f"auth failed ({status}); check ADMIN_API_KEY")
            if status == 400:
                detail = ""
                try:
                    detail = e.read().decode("utf-8", "ignore")[:300]
                except Exception:
                    pass
                raise TerminalWordError(f"bad request 400: {detail}")
            wait = backoff(attempt, hint=e.headers.get("Retry-After") if hasattr(e, "headers") else None)
            log(
                f"  ↻ {word_meta['word']}: HTTP {status} (attempt {attempt}), "
                f"sleeping {wait:.0f}s"
            )
            time.sleep(wait)
        except (urllib.error.URLError, TimeoutError, ConnectionError, TransientError) as e:
            wait = backoff(attempt)
            log(
                f"  ↻ {word_meta['word']}: {type(e).__name__} {str(e)[:80]} "
                f"(attempt {attempt}), sleeping {wait:.0f}s"
            )
            time.sleep(wait)
        except Exception as e:  # truly unexpected, still retry but log loud
            wait = backoff(attempt)
            log(
                f"  ⚠ {word_meta['word']}: unexpected {type(e).__name__} "
                f"{str(e)[:120]}, sleeping {wait:.0f}s"
            )
            time.sleep(wait)


class TerminalWordError(Exception):
    """A per-word problem that should not be retried (bad input, auth, etc.)."""


class TransientError(Exception):
    """A retryable problem reported by the server inside a 200."""


def backoff(attempt: int, hint: Optional[str] = None) -> float:
    """Exponential backoff with jitter, honors Retry-After when present."""
    if hint:
        try:
            return min(MAX_BACKOFF, max(1.0, float(hint)))
        except ValueError:
            pass
    base = min(MAX_BACKOFF, 2 ** min(attempt, 8))  # 2,4,8,16,...,256
    return base * (0.5 + random.random())  # jitter 0.5x..1.5x


def worker(word_meta: dict[str, Any], counter: dict[str, int], total: int) -> None:
    word = word_meta["word"]
    try:
        result = post_generate(word_meta)
        ok = result.get("ok", 0)
        skipped = result.get("skipped", 0)
        if ok or skipped:
            append_done(word)
            counter["ok"] += 1
            log(
                f"✓ {word} ({counter['ok']}/{total}) "
                f"images={(result.get('results') or [{}])[0].get('images', '?')}"
            )
        else:
            counter["fail"] += 1
            log_error(word, json.dumps(result)[:300])
            log(f"✗ {word}: server returned no ok/skip — {json.dumps(result)[:200]}")
    except TerminalWordError as e:
        counter["fail"] += 1
        log_error(word, f"TERMINAL: {e}")
        log(f"✗ {word}: terminal error: {e}")
        # mark as done so we don't keep retrying it across runs
        append_done(word)


# Graceful shutdown
_shutdown = threading.Event()


def _on_signal(signum, frame):
    log(f"Received signal {signum}, requesting shutdown after current jobs…")
    _shutdown.set()


signal.signal(signal.SIGINT, _on_signal)
signal.signal(signal.SIGTERM, _on_signal)


def main() -> None:
    log(f"API base: {API_BASE}")
    log(f"Input:    {INPUT_CSV}")
    log(f"Filter:   CEFR={sorted(CEFR_FILTER) or 'ALL'}  SOURCES={sorted(SOURCE_FILTER) or 'ALL'}  MAX={MAX_WORDS or '∞'}")
    log(f"Styles:   {STYLES}  Workers: {CONCURRENCY}")

    candidates = load_candidates()
    total = len(candidates)
    log(f"Loaded {total} candidates after filter & dedupe vs checkpoint.")
    if total == 0:
        log("Nothing to do. Exiting.")
        return

    counter = {"ok": 0, "fail": 0}
    started = time.time()

    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        futures = []
        for c in candidates:
            if _shutdown.is_set():
                break
            futures.append(ex.submit(worker, c, counter, total))
            # tiny stagger so we don't burst right at startup
            time.sleep(0.05)
        for fut in as_completed(futures):
            if _shutdown.is_set():
                break
            try:
                fut.result()
            except Exception as e:
                log(f"Worker crashed: {type(e).__name__} {e}")

    elapsed = time.time() - started
    log("=" * 60)
    log(f"Done. ok={counter['ok']}  fail={counter['fail']}  elapsed={elapsed/60:.1f} min")
    log(f"Average: {elapsed / max(counter['ok'], 1):.1f} s/word")
    log(f"Checkpoint: {CHECKPOINT_FILE}")
    log(f"Errors:     {ERROR_LOG_FILE}")


if __name__ == "__main__":
    main()
