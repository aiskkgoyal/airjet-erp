import { Request, Response } from "express";
import { createProductionEntry } from "./production.service";

export const createProductionEntryController = async (req:Request, res:Response) => {
  try {
    const payload = req.body;
    const result = await createProductionEntry(payload);
    res.json({ success:true, data: result });
  } catch(err:any) {
    console.error("createProductionEntry error:", err);
    res.status(400).json({ success:false, message: err.message });
  }
};