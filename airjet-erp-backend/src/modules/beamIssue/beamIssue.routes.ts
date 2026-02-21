import { Router } from "express";
import {
  createBeamIssueController,
  getActiveByBeamNoController,
  getActiveByLoomController,
  completeIssueController,
  listInactiveController,
  runInactiveAlertController
} from "./beamIssue.controller";

const router = Router();

router.post("/", createBeamIssueController); // body may include options.force_complete_existing
router.get("/active", getActiveByBeamNoController);
router.get("/active/loom/:loom_id", getActiveByLoomController);
router.post("/complete", completeIssueController);
router.get("/inactive", listInactiveController); // ?days=30
router.post("/inactive/check", runInactiveAlertController); // body { days: 30 }

export default router;