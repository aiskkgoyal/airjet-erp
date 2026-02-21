import { Router } from "express";
import { createBeamNameController, getBeamNamesController } from "./beamName.controller";
const router = Router();

router.post("/", createBeamNameController);
router.get("/", getBeamNamesController);

export default router;