import { pool } from "../../config/db";

export async function createBeamName(plant_id:number, beam_name:string, description:string|null, yarn:string|null, total_end:number|null, rs:string|null) {
  const res = await pool.query(
    `INSERT INTO beam_names (plant_id, beam_name, description, yarn, total_end, rs)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [plant_id, beam_name, description, yarn, total_end, rs]
  );
  return res.rows[0];
}

export async function getBeamNames(plant_id:number) {
  const res = await pool.query(
    `SELECT beam_name_id, beam_name, yarn, total_end, rs, description FROM beam_names WHERE plant_id = $1 ORDER BY beam_name`,
    [plant_id]
  );
  return res.rows;
}