import { pool } from "../../config/db";

export const createLoom = async (plant_id: number, loom_no: string) => {

  const result = await pool.query(
    "INSERT INTO looms (plant_id, loom_no) VALUES ($1,$2) RETURNING *",
    [plant_id, loom_no]
  );

  return result.rows[0];
};

export const getLooms = async (plant_id: number) => {

  const result = await pool.query(
    "SELECT loom_id, loom_no FROM looms WHERE plant_id = $1 ORDER BY loom_no",
    [plant_id]
  );

  return result.rows;
};