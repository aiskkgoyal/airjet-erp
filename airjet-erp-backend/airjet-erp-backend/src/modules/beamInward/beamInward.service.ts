// src/modules/beamInward/beamInward.service.ts
import { Pool } from "pg";
import { pool } from "../../config/db"; // adjust path if needed

export interface CreateInwardPayload {
  plant_id: number;
  inward_date?: string | Date | null;
  set_no?: string | null;
  beam_name_id?: number | null;
  beam_no?: string | null; // optional manual override
  sizing_meter: number;
  sizing_mark_interval?: number;
  created_by?: string | null;
}

export async function createBeamInwardAutoNumber(payload: CreateInwardPayload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      plant_id,
      inward_date = null,
      set_no = null,
      beam_name_id = null,
      beam_no = null,
      sizing_meter,
      sizing_mark_interval = 110,
      created_by = null
    } = payload;

    if (!plant_id) throw new Error("plant_id required");
    if (!sizing_meter || Number(sizing_meter) <= 0) throw new Error("sizing_meter must be > 0");

    let finalBeamNo = beam_no;

    // If manual beam_no not provided, allocate atomically from beam_number_sequences
    if (!finalBeamNo) {
      // ensure sequence row exists and lock it
      const seqSelect = await client.query(
        `SELECT current_number FROM beam_number_sequences WHERE plant_id = $1 FOR UPDATE`,
        [plant_id]
      );

      if (seqSelect.rows.length === 0) {
        // initialize row if missing
        await client.query(
          `INSERT INTO beam_number_sequences (plant_id, current_number) VALUES ($1, 0)`,
          [plant_id]
        );
      }

      const seqUpdate = await client.query(
        `UPDATE beam_number_sequences
         SET current_number = current_number + 1, updated_at = now()
         WHERE plant_id = $1
         RETURNING current_number`,
        [plant_id]
      );

      const seqNum = seqUpdate.rows[0].current_number;
      finalBeamNo = `B-${seqNum}`;
    } else {
      // sanitize whitespace
      // optional: normalize format
      finalBeamNo = String(finalBeamNo).trim();
    }

    // ensure beam_no unique (per plant)
    const check = await client.query(
      `SELECT beam_id FROM beams WHERE plant_id = $1 AND beam_no = $2`,
      [plant_id, finalBeamNo]
    );
    if (check.rows.length > 0) {
      throw new Error(`Beam number already exists: ${finalBeamNo}`);
    }

    // insert into beams
    const beamInsert = await client.query(
      `INSERT INTO beams (plant_id, beam_no, beam_name_id)
       VALUES ($1, $2, $3)
       RETURNING beam_id, beam_no`,
      [plant_id, finalBeamNo, beam_name_id]
    );

    const beam_id = beamInsert.rows[0].beam_id;

    // insert into beam_inwards
    const inwardInsert = await client.query(
      `INSERT INTO beam_inwards
       (plant_id, beam_id, inward_date, set_no, sizing_meter, sizing_mark_interval, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING inward_id, created_at`,
      [plant_id, beam_id, inward_date, set_no, sizing_meter, sizing_mark_interval, created_by]
    );

    const inward_id = inwardInsert.rows[0].inward_id;

    await client.query("COMMIT");

    return {
      success: true,
      beam: {
        beam_id,
        beam_no: finalBeamNo
      },
      inward: {
        inward_id,
        created_at: inwardInsert.rows[0].created_at
      }
    };
  } catch (err: any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Lightweight fetch helper
export async function getInwardByBeamNo(plant_id: number, beam_no: string) {
  const res = await pool.query(
    `SELECT bi.inward_id, b.beam_id, b.beam_no, bn.beam_name, bi.sizing_meter, bi.sizing_mark_interval, bi.inward_date, bi.set_no
     FROM beam_inwards bi
     JOIN beams b ON bi.beam_id = b.beam_id
     LEFT JOIN beam_names bn ON b.beam_name_id = bn.beam_name_id
     WHERE b.plant_id = $1 AND b.beam_no = $2
     ORDER BY bi.inward_date DESC
     LIMIT 1`,
    [plant_id, beam_no]
  );
  return res.rows[0] || null;
}

// preview next suggestion (non-reserving)
export async function getNextSuggestedBeamNo(plant_id: number) {
  const res = await pool.query(
    `SELECT current_number + 1 AS next_num FROM beam_number_sequences WHERE plant_id = $1`,
    [plant_id]
  );
  if (res.rows.length === 0) return null;
  return `B-${res.rows[0].next_num}`;
}