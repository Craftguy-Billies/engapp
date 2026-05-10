import { Router, type IRouter } from "express";
import { getStoredFile, ObjectNotFoundError, streamObjectToResponse } from "../lib/objectStorage";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// GET /api/images/:filename  → streams the generated card image from object storage
router.get("/images/:filename", async (req, res) => {
  const filename = req.params.filename;
  if (!/^[A-Za-z0-9_.-]+$/.test(filename)) {
    res.status(400).json({ error: "invalid filename" });
    return;
  }
  try {
    const file = getStoredFile(`images/${filename}`);
    await streamObjectToResponse(file, res);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "image not found" });
      return;
    }
    logger.error({ err, filename }, "failed to serve image");
    if (!res.headersSent) {
      res.status(500).json({ error: "internal error" });
    }
  }
});

export default router;
