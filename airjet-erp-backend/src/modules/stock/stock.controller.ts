import { Request, Response } from "express";
import { pool } from "../../config/db";

export const getStockSummaryController = async (req:Request, res:Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const rows = await pool.query(
      `SELECT w.warehouse_id, w.warehouse_name, w.type,
        COALESCE(SUM(sl.meter),0) AS total_meter, COALESCE(SUM(sl.weight),0) AS total_weight
       FROM warehouses w
       LEFT JOIN stock_ledger sl ON w.warehouse_id = sl.warehouse_id
       WHERE w.plant_id = $1
       GROUP BY w.warehouse_id, w.warehouse_name, w.type
       ORDER BY w.warehouse_name`, [plant_id]);
    res.json({ success:true, data: rows.rows });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};

export const getAlertsController = async (req:Request, res:Response) => {
  try {
    const plant_id = Number(req.query.plant_id || 1);
    const rows = await pool.query(`SELECT * FROM system_alerts WHERE plant_id = $1 ORDER BY created_at DESC`, [plant_id]);
    res.json({ success:true, data: rows.rows });
  } catch(err:any) {
    res.status(400).json({ success:false, message: err.message });
  }
};