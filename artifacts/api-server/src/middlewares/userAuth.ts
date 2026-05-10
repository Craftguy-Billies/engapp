import type { Request, Response, NextFunction } from "express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      appUser?: User;
    }
  }
}

/**
 * Identify or create a user.
 *
 * - If `Authorization: Bearer <clerk-jwt>` is present, the JWT subject is used as clerkId.
 *   (TODO: verify JWT signature once Clerk is wired in.)
 * - Otherwise, falls back to `X-Device-Id` header for anonymous/guest users.
 *
 * The handler will auto-create a row on first contact so the rest of the app can rely on req.appUser.
 */
export async function identifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = req.header("authorization") || "";
    const deviceId = req.header("x-device-id") || "";

    let clerkId: string | undefined;
    if (auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.slice(7).trim();
      // Lightweight unsafe decode — TODO: replace with verified Clerk JWT validation.
      const sub = unsafeDecodeJwtSub(token);
      if (sub) clerkId = sub;
    }

    if (!clerkId && !deviceId) {
      res.status(401).json({ error: "Missing X-Device-Id or Authorization header" });
      return;
    }

    let user: User | undefined;
    if (clerkId) {
      const found = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
      user = found[0];
      if (!user) {
        const inserted = await db
          .insert(usersTable)
          .values({ clerkId, deviceId: deviceId || null })
          .returning();
        user = inserted[0];
      }
    } else if (deviceId) {
      const found = await db.select().from(usersTable).where(eq(usersTable.deviceId, deviceId)).limit(1);
      user = found[0];
      if (!user) {
        const inserted = await db.insert(usersTable).values({ deviceId }).returning();
        user = inserted[0];
      }
    }

    if (!user) {
      res.status(500).json({ error: "Failed to identify user" });
      return;
    }
    req.appUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

function unsafeDecodeJwtSub(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      sub?: string;
    };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
