// src/modules/beamInward/beamInward.routes.ts
import { Router } from "express";
import {
  createBeamInwardController,
  getInwardByBeamNoController,
  getNextSuggestedBeamNoController
} from "./beamInward.controller";

const router = Router();

// Create inward (auto beam number if not provided)
router.post("/", createBeamInwardController);

// Get inward by beam_no (params or query)
router.get("/by-beam/:beam_no", getInwardByBeamNoController);
router.get("/by-beam", getInwardByBeamNoController);

// Get suggestion (non-reserving)
router.get("/suggest-next", getNextSuggestedBeamNoController);

export default router;