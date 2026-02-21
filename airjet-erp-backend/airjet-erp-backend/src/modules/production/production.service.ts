import { pool } from "../../config/db";

/**
 * payload:
 * {
 *  plant_id, issue_id, design_id,
 *  rows: [{ meter, weight, damage_meter, damage_weight, marks: [num,...] }, ...],
 *  created_by
 * }
 */
export async function createProductionEntry(payload:any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { plant_id, issue_id, design_id, rows, created_by } = payload;
    if (!plant_id || !issue_id || !Array.isArray(rows) || rows.length===0) throw new Error("Invalid payload");

    // Lock and get parent piece number (use a simple sequence table piece_sequences or reuse beam_number_sequences? 
    // We'll create a small table piece_sequences if not exists; for now use a table 'piece_sequences' per plant.)
    // Ensure piece_sequences exists in DB; else this will fail. Alternatively we can compute parent as MAX(parent_piece_no)+1 (risky concurrency).
    // Here we assume piece_sequences table exists. If not, fallback to simple SELECT max... (but it's not safe).
    const seqRes = await client.query(`SELECT current_number FROM piece_sequences WHERE plant_id = $1 FOR UPDATE`, [plant_id]);
    if (seqRes.rows.length === 0) {
      await client.query(`INSERT INTO piece_sequences (plant_id, current_number) VALUES ($1, 0)`, [plant_id]);
    }
    const upd = await client.query(`UPDATE piece_sequences SET current_number = current_number + 1 WHERE plant_id = $1 RETURNING current_number`, [plant_id]);
    const parent_piece_no = upd.rows[0].current_number;

    // Validate issue exists
    const issueRes = await client.query(`SELECT expected_meter, produced_meter FROM beam_issues WHERE issue_id = $1 FOR UPDATE`, [issue_id]);
    if (issueRes.rows.length === 0) throw new Error("Issue not found");
    const issueRow = issueRes.rows[0];
    const expected_meter = Number(issueRow.expected_meter || 0);
    let produced_meter_before = Number(issueRow.produced_meter || 0);

    // iterate rows, validate & compute
    let sum_meter = 0, sum_weight = 0, sum_damage_meter = 0, sum_damage_weight = 0, sum_net_meter = 0, sum_net_weight = 0;
    const insertedPieces:any[] = [];

    for (const r of rows) {
      const meter = Number(r.meter || 0);
      const weight = Number(r.weight || 0);
      const damage_meter = Number(r.damage_meter || 0);
      const damage_weight = Number(r.damage_weight || 0);
      const marks = Array.isArray(r.marks) ? r.marks.map(Number) : [];

      if (meter <= 0) throw new Error("Row meter must be > 0");
      if (damage_meter < 0 || damage_meter > meter) throw new Error("Invalid damage_meter");
      if (damage_weight < 0 || damage_weight > weight) throw new Error("Invalid damage_weight");

      // marks validation: strictly increasing and last <= meter
      for (let i=0;i<marks.length;i++){
        if (i>0 && marks[i] <= marks[i-1]) throw new Error("Marks must be strictly increasing");
        if (marks[i] > meter) throw new Error("Mark cannot be greater than roll meter");
      }

      // compute intervals
      let avg_mark_interval = null;
      if (marks.length >= 2) {
        const diffs:number[] = [];
        for (let i=1;i<marks.length;i++) diffs.push(marks[i] - marks[i-1]);
        const sumDiff = diffs.reduce((a,b)=>a+b,0);
        avg_mark_interval = Number((sumDiff / diffs.length).toFixed(4));
      }

      const net_meter = Number((meter - damage_meter).toFixed(3));
      const net_weight = Number((weight - damage_weight).toFixed(3));
      const weight_per_meter = net_meter>0 ? Number((net_weight / net_meter).toFixed(6)) : 0;

      sum_meter += meter;
      sum_weight += weight;
      sum_damage_meter += damage_meter;
      sum_damage_weight += damage_weight;
      sum_net_meter += net_meter;
      sum_net_weight += net_weight;

      // we'll insert pieces later after creating entry; collect piece data
      insertedPieces.push({
        meter, weight, damage_meter, damage_weight, net_meter, net_weight, weight_per_meter, avg_mark_interval, marks
      });
    }

    // Insert production_entries
    const entryRes = await client.query(
      `INSERT INTO production_entries (plant_id, issue_id, parent_piece_no, design_id, total_meter, total_weight, total_damage_meter, total_damage_weight, observed_mark_count, observed_mark_meter, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING entry_id`,
      [plant_id, issue_id, parent_piece_no, design_id||null, sum_meter, sum_weight, sum_damage_meter, sum_damage_weight, payload.observed_mark_count||null, payload.observed_mark_meter||null, created_by || null]
    );
    const entry_id = entryRes.rows[0].entry_id;

    // insert pieces and marks
    const pieceInsertPromises = [];
    for (let idx=0; idx<insertedPieces.length; idx++) {
      const p = insertedPieces[idx];
      const full_piece_no = `${idx+1}/${parent_piece_no}`;
      const pi = await client.query(
        `INSERT INTO production_pieces (entry_id, full_piece_no, meter, weight, damage_meter, damage_weight, net_meter, net_weight, weight_per_meter, avg_mark_interval)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING piece_id`,
        [entry_id, full_piece_no, p.meter, p.weight, p.damage_meter, p.damage_weight, p.net_meter, p.net_weight, p.weight_per_meter, p.avg_mark_interval]
      );
      const piece_id = pi.rows[0].piece_id;

      // marks
      for (let mindex=0;mindex<p.marks.length;mindex++) {
        const mm = p.marks[mindex];
        await client.query(`INSERT INTO production_piece_marks (piece_id, mark_index, mark_meter) VALUES ($1,$2,$3)`, [piece_id, mindex+1, mm]);
      }
    }

    // update stock_ledger: grey = net_meter/net_weight, scrap = damage
    // find warehouse ids for grey and scrap (assume plant has Grey and Scrap stores created)
    const wl = await client.query(`SELECT warehouse_id, type FROM warehouses WHERE plant_id = $1`, [plant_id]);
    let grey_id:number|null=null, scrap_id:number|null=null;
    for (const r of wl.rows) {
      if (r.type === 'GREY') grey_id = r.warehouse_id;
      if (r.type === 'SCRAP') scrap_id = r.warehouse_id;
    }
    if (!grey_id) throw new Error("Grey warehouse not found");
    if (!scrap_id) throw new Error("Scrap warehouse not found");

    // ledger grey
    if (sum_net_meter > 0) {
      await client.query(`INSERT INTO stock_ledger (plant_id, warehouse_id, reference_id, meter, weight, type) VALUES ($1,$2,$3,$4,$5,$6)`,
        [plant_id, grey_id, entry_id, sum_net_meter, sum_net_weight, 'IN']);
    }
    // ledger scrap
    if (sum_damage_meter > 0) {
      await client.query(`INSERT INTO stock_ledger (plant_id, warehouse_id, reference_id, meter, weight, type) VALUES ($1,$2,$3,$4,$5,$6)`,
        [plant_id, scrap_id, entry_id, sum_damage_meter, sum_damage_weight, 'IN']);
    }

    // update beam_issues produced_meter
    const new_produced_meter = Number((produced_meter_before + sum_net_meter).toFixed(3));
    await client.query(`UPDATE beam_issues SET produced_meter = $1 WHERE issue_id = $2`, [new_produced_meter, issue_id]);

    // set status & alerts
    let status = 'PARTIAL';
    if (new_produced_meter > expected_meter) {
      status = 'OVER_PRODUCED';
      // create alert
      const diff = Number((new_produced_meter - expected_meter).toFixed(3));
      await client.query(`INSERT INTO system_alerts (plant_id, issue_id, alert_type, message) VALUES ($1,$2,$3,$4)`,
        [plant_id, issue_id, 'OVER_PRODUCTION', `Over production by ${diff} meter for issue ${issue_id}`]);
    } else if (Math.abs(new_produced_meter - expected_meter) < 0.0001) {
      status = 'COMPLETE';
      // optionally set active=false
      await client.query(`UPDATE beam_issues SET active = false WHERE issue_id = $1`, [issue_id]);
    }
    await client.query(`UPDATE beam_issues SET status = $1 WHERE issue_id = $2`, [status, issue_id]);

    await client.query("COMMIT");

    return {
      success:true,
      entry_id,
      parent_piece_no,
      sum_meter,
      sum_net_meter,
      produced_meter_after: new_produced_meter,
      status_after: status
    };
  } catch(err:any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}