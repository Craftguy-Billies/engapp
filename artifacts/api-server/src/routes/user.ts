import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  usersTable,
  userBookmarksTable,
  userKnownWordsTable,
  userSeenWordsTable,
} from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { identifyUser } from "../middlewares/userAuth";

const router: IRouter = Router();
router.use(identifyUser);

// GET /api/user/me
router.get("/me", async (req, res) => {
  res.json({ user: req.appUser });
});

const patchMeSchema = z.object({
  preferredStyleId: z.number().int().nullable().optional(),
  preferredTtsAccent: z.enum(["en-US", "en-GB"]).optional(),
  uiLanguage: z.string().min(2).max(8).optional(),
  learningGoal: z.enum(["casual", "travel", "business", "toefl", "ielts"]).optional(),
  dailyGoal: z.number().int().min(0).max(200).optional(),
  examDate: z.string().nullable().optional(),
});

router.patch("/me", async (req, res, next) => {
  try {
    const parsed = patchMeSchema.parse(req.body ?? {});
    const updated = await db
      .update(usersTable)
      .set({
        ...(parsed.preferredStyleId !== undefined ? { preferredStyleId: parsed.preferredStyleId } : {}),
        ...(parsed.preferredTtsAccent ? { preferredTtsAccent: parsed.preferredTtsAccent } : {}),
        ...(parsed.uiLanguage ? { uiLanguage: parsed.uiLanguage } : {}),
        ...(parsed.learningGoal ? { learningGoal: parsed.learningGoal } : {}),
        ...(parsed.dailyGoal !== undefined ? { dailyGoal: parsed.dailyGoal } : {}),
        ...(parsed.examDate !== undefined ? { examDate: parsed.examDate } : {}),
      })
      .where(eq(usersTable.id, req.appUser!.id))
      .returning();
    res.json({ user: updated[0] });
  } catch (err) {
    next(err);
  }
});

const wordIdSchema = z.object({ wordId: z.number().int().positive() });

// POST /api/user/bookmarks
router.post("/bookmarks", async (req, res, next) => {
  try {
    const { wordId } = wordIdSchema.parse(req.body);
    await db
      .insert(userBookmarksTable)
      .values({ userId: req.appUser!.id, wordId })
      .onConflictDoNothing();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/bookmarks/:wordId", async (req, res, next) => {
  try {
    const wordId = Number(req.params.wordId);
    await db
      .delete(userBookmarksTable)
      .where(and(eq(userBookmarksTable.userId, req.appUser!.id), eq(userBookmarksTable.wordId, wordId)));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/bookmarks", async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(userBookmarksTable)
      .where(eq(userBookmarksTable.userId, req.appUser!.id));
    res.json({ bookmarks: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/user/known — mark word known + schedule revisit in 7 days
router.post("/known", async (req, res, next) => {
  try {
    const { wordId } = wordIdSchema.parse(req.body);
    const revisitAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db
      .insert(userKnownWordsTable)
      .values({ userId: req.appUser!.id, wordId, revisitAt })
      .onConflictDoNothing();
    res.json({ ok: true, revisitAt });
  } catch (err) {
    next(err);
  }
});

router.get("/known", async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(userKnownWordsTable)
      .where(eq(userKnownWordsTable.userId, req.appUser!.id));
    res.json({ known: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/revisit", async (req, res, next) => {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(userKnownWordsTable)
      .where(
        and(
          eq(userKnownWordsTable.userId, req.appUser!.id),
          sql`${userKnownWordsTable.revisitAt} IS NOT NULL`,
          sql`${userKnownWordsTable.revisitAt} <= ${now}`,
        ),
      );
    res.json({ revisit: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/user/seen — log that user saw a word (drives feed dedupe and streak)
router.post("/seen", async (req, res, next) => {
  try {
    const { wordId } = wordIdSchema.parse(req.body);
    await db
      .insert(userSeenWordsTable)
      .values({ userId: req.appUser!.id, wordId })
      .onConflictDoNothing();

    // Update streak
    const today = new Date();
    const todayDateStr = today.toISOString().slice(0, 10);
    const last = req.appUser!.lastActiveDate as string | null | undefined;
    let newStreak = req.appUser!.discoveryStreakDays;
    if (last !== todayDateStr) {
      if (last) {
        const lastDate = new Date(last + "T00:00:00Z");
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
        newStreak = diffDays === 1 ? newStreak + 1 : 1;
      } else {
        newStreak = 1;
      }
      await db
        .update(usersTable)
        .set({ lastActiveDate: todayDateStr, discoveryStreakDays: newStreak })
        .where(eq(usersTable.id, req.appUser!.id));
    }

    res.json({ ok: true, streak: newStreak });
  } catch (err) {
    next(err);
  }
});

// GET /api/user/stats — daily progress + streak
router.get("/stats", async (req, res, next) => {
  try {
    const userId = req.appUser!.id;
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);

    const [todayCountRow, totalKnownRow, totalBookmarkedRow] = await Promise.all([
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(userSeenWordsTable)
        .where(and(eq(userSeenWordsTable.userId, userId), gte(userSeenWordsTable.seenAt, dayStart))),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(userKnownWordsTable)
        .where(eq(userKnownWordsTable.userId, userId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(userBookmarksTable)
        .where(eq(userBookmarksTable.userId, userId)),
    ]);

    const todayCount = Number(todayCountRow[0]?.c ?? 0);
    const dailyGoal = req.appUser!.dailyGoal;
    const streak = req.appUser!.discoveryStreakDays;
    const projected30 = dailyGoal > 0 ? dailyGoal * 30 : todayCount * 30;
    const projected90 = dailyGoal > 0 ? dailyGoal * 90 : todayCount * 90;

    res.json({
      todayCount,
      dailyGoal,
      streak,
      projectedWords30d: projected30,
      projectedWords90d: projected90,
      totalKnown: Number(totalKnownRow[0]?.c ?? 0),
      totalBookmarked: Number(totalBookmarkedRow[0]?.c ?? 0),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
