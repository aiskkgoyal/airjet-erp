import { Router } from "express";
import { getStockSummaryController, getAlertsController } from "./stock.controller";
const router = Router();

router.get("/summary", getStockSummaryController);
router.get("/alerts", getAlertsController);

export default router;