import { Router, type IRouter } from "express";
import adminAuthRouter from "./auth";
import adminDashboardRouter from "./dashboard";
import adminAdvisorsRouter from "./advisors";
import adminAdminsRouter from "./admins";
import adminFnaRouter from "./fna";
import adminAppointmentsRouter from "./appointments";
import adminPoliciesRouter from "./policies";
import adminDocumentsRouter from "./documents";
import adminClientsRouter from "./clients";
import adminLeadsRouter from "./leads";
import adminEmailRouter from "./email";
import adminCampaignsRouter from "./campaigns";

const router: IRouter = Router();

router.use(adminAuthRouter);
router.use(adminDashboardRouter);
router.use(adminAdvisorsRouter);
router.use(adminAdminsRouter);
router.use(adminFnaRouter);
router.use(adminAppointmentsRouter);
router.use(adminPoliciesRouter);
router.use(adminDocumentsRouter);
router.use(adminClientsRouter);
router.use(adminLeadsRouter);
router.use(adminEmailRouter);
router.use(adminCampaignsRouter);

export default router;
