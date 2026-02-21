import { pool } from "../../config/db";

export const getNextParentPiece = async (plant_id: number) => {

  const result = await pool.query(
    "SELECT current_parent_piece_no FROM piece_sequences WHERE plant_id = $1",
    [plant_id]
  );

  if (result.rows.length === 0) {
    throw new Error("Sequence not found");
  }

  const next = Number(result.rows[0].current_parent_piece_no) + 1;

  return next;
};