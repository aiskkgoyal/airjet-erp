// src/modules/beamIssue/beamIssue.service.ts
import { pool } from "../../config/db";

/**
 * Fetch active issue by beam_no (existing)
 */
export async function getActiveIssueByBeamNo(plant_id:number, beam_no:string) {
  const res = await pool.query(
    `SELECT bi.*, b.beam_no, bn.beam_name, d.design_no, d.average_meter
     FROM beam_issues bi
     JOIN beams b ON bi.beam_id = b.beam_id
     LEFT JOIN beam_names bn ON b.beam_name_id = bn.beam_name_id
     LEFT JOIN designs d ON bi.design_id = d.design_id
     WHERE b.plant_id = $1 AND b.beam_no = $2 AND bi.active = true
     ORDER BY bi.issued_at DESC
     LIMIT 1`,
    [plant_id, beam_no]
  );
  return res.rows[0] || null;
}

/**
 * NEW: fetch active issue by loom_id
 */
export async function getActiveIssueByLoom(plant_id:number, loom_id:number) {
  const res = await pool.query(
    `SELECT bi.*, b.beam_no, bn.beam_name, d.design_no, d.average_meter
     FROM beam_issues bi
     JOIN beams b ON bi.beam_id = b.beam_id
     LEFT JOIN beam_names bn ON b.beam_name_id = bn.beam_name_id
     LEFT JOIN designs d ON bi.design_id = d.design_id
     WHERE bi.plant_id = $1 AND bi.loom_id = $2 AND bi.active = true
     ORDER BY bi.issued_at DESC
     LIMIT 1`,
    [plant_id, loom_id]
  );
  return res.rows[0] || null;
}

/**
 * Complete an issue (mark complete, set completed_by/completed_at, active=false)
 */
export async function completeBeamIssue(issue_id:number, completed_by:string|null=null) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Set COMPLETE + active=false
    await client.query(
      `UPDATE beam_issues
       SET status = 'COMPLETE', active = false, completed_by = $1, completed_at = now()
       WHERE issue_id = $2`,
      [completed_by, issue_id]
    );

    await client.query("COMMIT");
    return { success: true, issue_id };
  } catch (err:any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}


/**
 * Create issue with loom-lock behavior.
 * If an active issue exists on same loom:
 *   - if options.force_complete_existing === true -> complete that issue & continue to create new issue
 *   - else -> return { warning: true, activeIssue } and DO NOT create new issue
 *
 * payload expects: { plant_id, inward_id OR beam_id, loom_id, design_id, fabric_mark_interval, roll_per_meter, issued_by, options: { force_complete_existing:boolean }}
 */
export async function createBeamIssueWithLoomLock(payload:any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      plant_id,
      inward_id,
      beam_id,
      loom_id,
      design_id,
      fabric_mark_interval,
      roll_per_meter,
      issued_by,
      options = {}
    } = payload;

    if (!plant_id) throw new Error("plant_id is required");
    if (!loom_id) throw new Error("loom_id is required");
    if (!inward_id && !beam_id) throw new Error("inward_id or beam_id required");

    // 1) Check for existing active issue on this loom
    const active = await client.query(
      `SELECT bi.issue_id, bi.expected_meter, bi.produced_meter, bi.sizing_meter, bi.sizing_mark_interval, bi.fabric_mark_interval, bi.design_id, b.beam_no
       FROM beam_issues bi
       JOIN beams b ON bi.beam_id = b.beam_id
       WHERE bi.plant_id = $1 AND bi.loom_id = $2 AND bi.active = true
       ORDER BY bi.issued_at DESC
       LIMIT 1`,
      [plant_id, loom_id]
    );

    if (active.rows.length > 0) {
      const activeIssue = active.rows[0];
      if (!options.force_complete_existing) {
        // Return warning (do NOT create)
        await client.query("ROLLBACK");
        return { warning: true, activeIssue };
      } else {
        // complete the existing issue first
        await client.query(
          `UPDATE beam_issues SET status = 'COMPLETE', active = false, completed_by = $1, completed_at = now()
           WHERE issue_id = $2`,
          [issued_by || 'system', activeIssue.issue_id]
        );
        // also insert an alert that issue was auto-completed? optional
      }
    }

    // 2) Continue with normal create (similar to previous createBeamIssue)
    // get inwardRow
    let inwardRow = null;
    if (inward_id) {
      const r = await client.query(`SELECT * FROM beam_inwards WHERE inward_id = $1`, [inward_id]);
      if (r.rows.length === 0) throw new Error("Inward not found");
      inwardRow = r.rows[0];
    } else {
      // beam_id provided: try to find inward for it
      const r2 = await client.query(`SELECT * FROM beam_inwards WHERE beam_id = $1 ORDER BY inward_date DESC LIMIT 1`, [beam_id]);
      if (r2.rows.length > 0) inwardRow = r2.rows[0];
    }

    let sizing_meter = inwardRow?.sizing_meter || null;
    let sizing_mark_interval = inwardRow?.sizing_mark_interval || null;
    let predicted_marks = null;
    let predicted_fabric_meter = null;
    let used_fabric_mark_interval = fabric_mark_interval || null;

    if (sizing_meter && sizing_mark_interval && design_id) {
      const d = await client.query(`SELECT average_meter FROM designs WHERE design_id = $1`, [design_id]);
      const design_avg = d.rows.length ? d.rows[0].average_meter : null;
      if (!used_fabric_mark_interval && design_avg) used_fabric_mark_interval = design_avg;
      if (used_fabric_mark_interval) {
        predicted_marks = Math.floor(Number(sizing_meter) / Number(sizing_mark_interval));
        predicted_fabric_meter = (Number(sizing_meter) / Number(sizing_mark_interval)) * Number(used_fabric_mark_interval);
        predicted_fabric_meter = Math.round(predicted_fabric_meter * 1000) / 1000;
      }
    }

    const ins = await client.query(
      `INSERT INTO beam_issues
       (plant_id, inward_id, beam_id, loom_id, design_id, sizing_meter, sizing_mark_interval, fabric_mark_interval, predicted_marks, predicted_fabric_meter, expected_meter, roll_per_meter, issued_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING issue_id`,
      [plant_id, inwardRow?.inward_id || null, inwardRow?.beam_id || beam_id || null, loom_id, design_id || null, sizing_meter, sizing_mark_interval, used_fabric_mark_interval, predicted_marks, predicted_fabric_meter, predicted_fabric_meter, roll_per_meter||null, issued_by||null]
    );

    await client.query("COMMIT");
    return { success: true, issue_id: ins.rows[0].issue_id, predicted_marks, predicted_fabric_meter };

  } catch (err:any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Find beams active longer than X days
 */
export async function findInactiveBeams(days:number=30) {
  const res = await pool.query(
    `SELECT bi.issue_id, b.beam_no, bi.issued_at, bi.sizing_meter, bi.expected_meter, bi.produced_meter, bi.loom_id
     FROM beam_issues bi
     JOIN beams b ON bi.beam_id = b.beam_id
     WHERE bi.active = true AND bi.issued_at < (now() - ($1 || ' days')::interval)
     ORDER BY bi.issued_at ASC`,
    [days]
  );
  return res.rows;
}

/**
 * Create alerts for inactive beams older than X days (idempotent-ish)
 * Will create an alert record if no existing INACTIVE_BEAM alert for that issue_id exists.
 */
export async function checkAndCreateInactiveAlerts(days:number=30) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const beams = await client.query(
      `SELECT bi.issue_id, b.beam_no, bi.issued_at
       FROM beam_issues bi
       JOIN beams b ON bi.beam_id = b.beam_id
       WHERE bi.active = true AND bi.issued_at < (now() - ($1 || ' days')::interval)`,
      [days]
    );

    let created = 0;
    for (const row of beams.rows) {
      const issue_id = row.issue_id;
      // check existing alert
      const a = await client.query(`SELECT 1 FROM system_alerts WHERE issue_id = $1 AND alert_type = 'INACTIVE_BEAM' LIMIT 1`, [issue_id]);
      if (a.rows.length === 0) {
        await client.query(`INSERT INTO system_alerts (plant_id, issue_id, alert_type, message) VALUES ($1,$2,$3,$4)`,
          [null, issue_id, 'INACTIVE_BEAM', `Beam issue ${issue_id} inactive since ${row.issued_at}`]);
        created++;
      }
    }

    await client.query("COMMIT");
    return { success: true, created };
  } catch (err:any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}