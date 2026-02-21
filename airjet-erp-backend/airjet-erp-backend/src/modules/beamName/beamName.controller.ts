import { Request, Response } from "express";
import { createBeamName, getBeamNames } from "./beamName.service";

export const createBeamNameController = async (req: Request, res: Response) => {
  try {
    const { plant_id, beam_name, description, yarn, total_end, rs } = req.body;
    if (!plant_id || !beam_name) return res.status(400).json({ success:false, message: "plant_id and beam_name required" });
    const row = await createBeamName(plant_id, beam_name, description||null, yarn||null, total_end||null, rs||null);
    res.json({ success:true, data: row });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getBeamNamesController = async (req: Request, res: Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const rows = await getBeamNames(plant_id);
    res.json({ success:true, data: rows });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};