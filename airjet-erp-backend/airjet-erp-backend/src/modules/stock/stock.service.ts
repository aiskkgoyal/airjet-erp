import { pool } from "../../config/db";

export const getStockSummary = async (plant_id: number) => {

  const result = await pool.query(
    `
    SELECT 
      w.warehouse_id,
      w.warehouse_name,
      w.warehouse_type,
      COALESCE(SUM(sl.meter), 0) AS total_meter,
      COALESCE(SUM(sl.weight), 0) AS total_weight
    FROM warehouses w
    LEFT JOIN stock_ledger sl
      ON w.warehouse_id = sl.warehouse_id
    WHERE w.plant_id = $1
    GROUP BY w.warehouse_id, w.warehouse_name, w.warehouse_type
    ORDER BY w.warehouse_type
    `,
    [plant_id]
  );

  return result.rows;
};

export const getWarehouseStockDetails = async (
  plant_id: number,
  warehouse_id: number
) => {

  const result = await pool.query(
    `
    SELECT 
      sl.reference_id,
      pe.parent_piece_no,
      pp.full_piece_no,
      pp.net_meter AS meter,
      pp.net_weight AS weight,
      pe.created_at
    FROM stock_ledger sl
    JOIN production_entries pe ON sl.reference_id = pe.entry_id
    JOIN production_pieces pp ON pe.entry_id = pp.entry_id
    WHERE sl.plant_id = $1
      AND sl.warehouse_id = $2
    ORDER BY pe.created_at DESC
    `,
    [plant_id, warehouse_id]
  );

  return result.rows;
};