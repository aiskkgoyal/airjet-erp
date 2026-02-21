import { pool } from "../../config/db";

export const getDashboardSummary = async (plant_id: number) => {

  const activeBeams = await pool.query(
    "SELECT COUNT(*) FROM beam_issues WHERE plant_id = $1 AND active = TRUE",
    [plant_id]
  );

  const greyStock = await pool.query(
    `SELECT COALESCE(SUM(sl.meter),0) as total
     FROM stock_ledger sl
     JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
     WHERE sl.plant_id = $1 AND w.type = 'GREY'`,
    [plant_id]
  );

  const scrapStock = await pool.query(
    `SELECT COALESCE(SUM(sl.meter),0) as total
     FROM stock_ledger sl
     JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
     WHERE sl.plant_id = $1 AND w.type = 'SCRAP'`,
    [plant_id]
  );

  return {
    active_beams: Number(activeBeams.rows[0].count),
    grey_stock: Number(greyStock.rows[0].total),
    scrap_stock: Number(scrapStock.rows[0].total)
  };
};