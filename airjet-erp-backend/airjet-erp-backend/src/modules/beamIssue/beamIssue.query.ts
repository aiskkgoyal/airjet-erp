import { pool } from "../../config/db";

export const getActiveBeamByBeamNo = async (plant_id: number, beam_no: string) => {

  const result = await pool.query(
    `
    SELECT 
      bi.issue_id,
      b.beam_no,
      l.loom_no,
      bi.set_no,
      bi.design_no,
      bi.expected_meter,
      bi.produced_meter,
      (bi.expected_meter - bi.produced_meter) AS balance_meter,
      bi.status
    FROM beam_issues bi
    JOIN beams b ON bi.beam_id = b.beam_id
    JOIN looms l ON bi.loom_id = l.loom_id
    WHERE bi.plant_id = $1
      AND b.beam_no = $2
      AND bi.active = TRUE
    `,
    [plant_id, beam_no]
  );

  return result.rows[0];
};
export const getActiveBeamByLoom = async (plant_id: number, loom_no: string) => {

  const result = await pool.query(
    `
    SELECT 
      bi.issue_id,
      b.beam_no,
      bi.set_no,
      bi.design_no,
      bi.expected_meter,
      bi.produced_meter,
      (bi.expected_meter - bi.produced_meter) AS balance_meter
    FROM beam_issues bi
    JOIN beams b ON bi.beam_id = b.beam_id
    JOIN looms l ON bi.loom_id = l.loom_id
    WHERE bi.plant_id = $1
      AND l.loom_no = $2
      AND bi.active = TRUE
    `,
    [plant_id, loom_no]
  );

  return result.rows[0];
};

export const getOfficeBeamList = async (plant_id: number) => {

  const result = await pool.query(
    `
    SELECT 
      bi.issue_id,
      b.beam_no,
      l.loom_no,
      bi.set_no,
      bi.design_no,
      bi.expected_meter,
      bi.produced_meter,
      (bi.expected_meter - bi.produced_meter) AS balance_meter,
      bi.status,
      bi.active,
      bi.issued_at
    FROM beam_issues bi
    JOIN beams b ON bi.beam_id = b.beam_id
    JOIN looms l ON bi.loom_id = l.loom_id
    WHERE bi.plant_id = $1
    ORDER BY bi.issued_at DESC
    `,
    [plant_id]
  );

  return result.rows;
};