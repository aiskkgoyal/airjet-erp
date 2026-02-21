// src/modules/beamInward/beamInward.controller.ts
import { Request, Response } from "express";
import {
  createBeamInwardAutoNumber,
  getInwardByBeamNo,
  getNextSuggestedBeamNo
} from "./beamInward.service";

export const createBeamInwardController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await createBeamInwardAutoNumber(payload);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error("createBeamInward error:", err);
    return res.status(400).json({ success: false, message: err.message || "Error" });
  }
};

export const getInwardByBeamNoController = async (req: Request, res: Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const beam_no = String(req.params.beam_no || req.query.beam_no || "").trim();
    if (!beam_no) return res.status(400).json({ success: false, message: "beam_no required" });

    const row = await getInwardByBeamNo(plant_id, beam_no);
    return res.json({ success: true, data: row });
  } catch (err: any) {
    console.error("getInwardByBeamNo error:", err);
    return res.status(400).json({ success: false, message: err.message || "Error" });
  }
};

export const getNextSuggestedBeamNoController = async (req: Request, res: Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const next = await getNextSuggestedBeamNo(plant_id);
    return res.json({ success: true, next_beam_no: next });
  } catch (err: any) {
    console.error("getNextSuggestedBeamNo error:", err);
    return res.status(400).json({ success: false, message: err.message || "Error" });
  }
};