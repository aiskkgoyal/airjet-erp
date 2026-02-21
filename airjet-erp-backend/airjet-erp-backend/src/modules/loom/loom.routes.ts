import { Router } from "express";
import { createLoomController, getLoomsController } from "./loom.controller";

const router = Router();

router.post("/", createLoomController);
router.get("/", getLoomsController);

export default router;