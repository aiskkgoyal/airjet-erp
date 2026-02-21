import { Router } from "express";
import { createDesignController, getDesignsController, getDesignByIdController } from "./design.controller";
const router = Router();

router.post("/", createDesignController);
router.get("/", getDesignsController);
router.get("/:id", getDesignByIdController);

export default router;