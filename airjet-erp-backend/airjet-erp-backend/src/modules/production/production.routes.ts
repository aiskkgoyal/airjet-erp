import { Router } from "express";
import { createProductionEntryController } from "./production.controller";
const router = Router();

router.post("/", createProductionEntryController);

export default router;