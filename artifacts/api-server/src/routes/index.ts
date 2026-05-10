import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import wordsRouter from "./words";
import userRouter from "./user";
import imagesRouter from "./images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imagesRouter);
router.use("/admin", adminRouter);
router.use("/words", wordsRouter);
router.use("/user", userRouter);

export default router;
