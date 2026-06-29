import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";
import publicRouter from "./public";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/dashboard", dashboardRouter);
router.use("/public", publicRouter);
router.use("/messages", messagesRouter);

export default router;
