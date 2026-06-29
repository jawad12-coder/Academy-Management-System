import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import adminRouter from "./admin.js";
import dashboardRouter from "./dashboard.js";
import publicRouter from "./public.js";
import messagesRouter from "./messages.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/dashboard", dashboardRouter);
router.use("/public", publicRouter);
router.use("/messages", messagesRouter);

export default router;
