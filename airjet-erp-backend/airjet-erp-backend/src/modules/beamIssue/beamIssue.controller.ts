// src/modules/beamIssue/beamIssue.controller.ts
import { Request, Response } from "express";
import {
  createBeamIssueWithLoomLock,
  getActiveIssueByBeamNo,
  getActiveIssueByLoom,
  completeBeamIssue,
  findInactiveBeams,
  checkAndCreateInactiveAlerts
} from "./beamIssue.service";

export const createBeamIssueController = async (req:Request, res:Response) => {
  try {
    // payload may include options.force_complete_existing boolean
    const result = await createBeamIssueWithLoomLock(req.body);
    if (result.warning) {
      return res.json({ success: true, warning: true, data: result.activeIssue || result.warning });
    }
    return res.json({ success: true, data: result });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getActiveByBeamNoController = async (req:Request, res:Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const beam_no = String(req.query.beam_no || "");
    if (!beam_no) return res.status(400).json({ success:false, message: "beam_no required" });
    const row = await getActiveIssueByBeamNo(plant_id, beam_no);
    res.json({ success:true, data: row });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getActiveByLoomController = async (req:Request, res:Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const loom_id = Number(req.params.loom_id || req.query.loom_id);
    if (!loom_id) return res.status(400).json({ success:false, message: "loom_id required" });
    const row = await getActiveIssueByLoom(plant_id, loom_id);
    res.json({ success:true, data: row });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const completeIssueController = async (req:Request, res:Response) => {
  try {
    const { issue_id, completed_by } = req.body;
    if (!issue_id) return res.status(400).json({ success:false, message: "issue_id required" });
    const result = await completeBeamIssue(issue_id, completed_by || null);
    res.json({ success:true, data: result });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const listInactiveController = async (req:Request, res:Response) => {
  try {
    const days = Number(req.query.days || 30);
    const rows = await findInactiveBeams(days);
    res.json({ success:true, data: rows });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const runInactiveAlertController = async (req:Request, res:Response) => {
  try {
    const days = Number(req.body.days || 30);
    const r = await checkAndCreateInactiveAlerts(days);
    res.json({ success:true, data: r });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};