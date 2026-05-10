import type { Request, Response, NextFunction } from "express";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!ADMIN_API_KEY) {
    res.status(500).json({ error: "ADMIN_API_KEY not configured on server" });
    return;
  }
  const header = req.header("x-admin-key") || "";
  const bearer = req.header("authorization") || "";
  const provided = header || bearer.replace(/^Bearer\s+/i, "");
  if (provided !== ADMIN_API_KEY) {
    res.status(401).json({ error: "Invalid admin key" });
    return;
  }
  next();
}
