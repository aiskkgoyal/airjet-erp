import { Request, Response } from "express";
import { createDesign, getDesigns, getDesignById } from "./design.service";

export const createDesignController = async (req:Request, res:Response) => {
  try {
    const row = await createDesign(req.body);
    res.json({ success:true, data: row });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getDesignsController = async (req:Request, res:Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const rows = await getDesigns(plant_id);
    res.json({ success:true, data: rows });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getDesignByIdController = async (req:Request, res:Response) => {
  try {
    const design_id = Number(req.params.id);
    const row = await getDesignById(design_id);
    res.json({ success:true, data: row });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};