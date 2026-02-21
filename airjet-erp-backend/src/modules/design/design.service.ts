import { pool } from "../../config/db";

export async function createDesign(payload: any) {
  const { plant_id, design_no, description, reed, pick, warp_yarn, weft_yarn, width, average_meter, average_weight } = payload;
  const res = await pool.query(
    `INSERT INTO designs (plant_id, design_no, description, reed, pick, warp_yarn, weft_yarn, width, average_meter, average_weight)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [plant_id, design_no, description||null, reed||null, pick||null, warp_yarn||null, weft_yarn||null, width||null, average_meter||null, average_weight||null]
  );
  return res.rows[0];
}

export async function getDesigns(plant_id:number) {
  const res = await pool.query(
    `SELECT design_id, design_no, description, reed, pick, warp_yarn, weft_yarn, width, average_meter, average_weight
     FROM designs WHERE plant_id = $1 ORDER BY design_no`,
    [plant_id]
  );
  return res.rows;
}

export async function getDesignById(design_id:number) {
  const res = await pool.query(`SELECT * FROM designs WHERE design_id = $1`, [design_id]);
  return res.rows[0] || null;
}