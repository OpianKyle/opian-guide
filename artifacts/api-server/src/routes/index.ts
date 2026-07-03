import { Router, type IRouter } from "express";
import healthRouter from "./health";
import advisorsRouter from "./advisors";
import fnaRouter from "./fna";
import policiesRouter from "./policies";
import appointmentsRouter from "./appointments";
import documentsRouter from "./documents";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(advisorsRouter);
router.use(fnaRouter);
router.use(policiesRouter);
router.use(appointmentsRouter);
router.use(documentsRouter);

export default router;
