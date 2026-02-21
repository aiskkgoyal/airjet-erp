import { Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service";

export const dashboardController = async (req: Request, res: Response) => {
  try {
    const plant_id = Number(req.query.plant_id);
    const result = await getDashboardSummary(plant_id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};