import { Request, Response } from "express";
import { createLoom, getLooms } from "./loom.service";

export const createLoomController = async (req: Request, res: Response) => {
  try {
    const { plant_id, loom_no } = req.body;
    const result = await createLoom(plant_id, loom_no);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLoomsController = async (req: Request, res: Response) => {
  try {
    const plant_id = Number(req.query.plant_id);
    const result = await getLooms(plant_id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};