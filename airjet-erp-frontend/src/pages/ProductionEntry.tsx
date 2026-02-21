import { useEffect, useState } from "react";
import { api } from "../api";

export default function ProductionEntry() {

  const [beamNo, setBeamNo] = useState("");
  const [issue, setIssue] = useState<any>(null);
  const [designId, setDesignId] = useState<number | null>(null);

  const [rows, setRows] = useState<any[]>([]);

  // 🔎 Fetch Active Beam
  const fetchBeam = async () => {
    try {
      const res = await api.get(`/beam-issues/active?plant_id=1&beam_no=${beamNo}`);
      setIssue(res.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || "Active beam not found");
      setIssue(null);
    }
  };

  // ➕ Add Row
  const addRow = () => {
    setRows([
      ...rows,
      {
        meter: 0,
        weight: 0,
        damage_meter: 0,
        damage_weight: 0,
        marks: []
      }
    ]);
  };

  // ❌ Delete Row
  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // ➕ Add Mark
  const addMark = (rowIndex: number) => {
    const updated = [...rows];
    updated[rowIndex].marks.push(0);
    setRows(updated);
  };

  // 🔢 Calculate Avg Interval
  const calculateAvg = (marks: number[]) => {
    if (marks.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < marks.length; i++) {
      total += (marks[i] - marks[i - 1]);
    }
    return (total / (marks.length - 1)).toFixed(2);
  };

  // ✅ Validate
  const isValid = () => {
    if (!issue || !designId) return false;

    for (const row of rows) {
      const net = row.meter - row.damage_meter;
      if (net <= 0) return false;
      if (row.marks.length < 2) return false;
    }
    return rows.length > 0;
  };

  // 💾 Save
  const handleSave = async () => {
    try {
      await api.post("/production-entry", {
        plant_id: 1,
        issue_id: issue.issue_id,
        design_id: designId,
        pieces: rows
      });

      alert("Production Saved Successfully");
      setRows([]);
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>Production Entry</h2>

      {/* Beam Search */}
      <input
        placeholder="Beam No"
        value={beamNo}
        onChange={e => setBeamNo(e.target.value)}
      />
      <button onClick={fetchBeam}>Search</button>

      {issue && (
        <div style={{ marginTop: 10, background: "#eee", padding: 10 }}>
          <p>Loom: {issue.loom_no}</p>
          <p>Set: {issue.set_no}</p>
          <p>Expected: {issue.expected_meter}</p>
          <p>Produced: {issue.produced_meter}</p>
          <p>Balance: {issue.balance_meter}</p>
          <p><strong>Issue Lf:</strong> {issue.lf_meter}</p>
        </div>
      )}

      <hr />

      {/* Design Select */}
      {issue && (
        <select onChange={e => setDesignId(Number(e.target.value))}>
          <option value="">Select Design</option>
          <option value="1">Design 1</option>
          <option value="2">Design 2</option>
        </select>
      )}

      <hr />

      <button onClick={addRow}>Add Roll</button>

      {rows.map((row, index) => {

        const net_meter = row.meter - row.damage_meter;
        const net_weight = row.weight - row.damage_weight;
        const wpm = net_meter > 0 ? (net_weight / net_meter).toFixed(4) : 0;
        const avgLf = calculateAvg(row.marks);

        return (
          <div key={index} style={{
            marginTop: 15,
            border: "1px solid #ccc",
            padding: 10
          }}>

            <strong>Roll {index + 1}</strong><br />

            <input type="number" placeholder="Meter"
              onChange={e => {
                const updated = [...rows];
                updated[index].meter = Number(e.target.value);
                setRows(updated);
              }} />

            <input type="number" placeholder="Weight"
              onChange={e => {
                const updated = [...rows];
                updated[index].weight = Number(e.target.value);
                setRows(updated);
              }} />

            <input type="number" placeholder="Damage Meter"
              onChange={e => {
                const updated = [...rows];
                updated[index].damage_meter = Number(e.target.value);
                setRows(updated);
              }} />

            <input type="number" placeholder="Damage Weight"
              onChange={e => {
                const updated = [...rows];
                updated[index].damage_weight = Number(e.target.value);
                setRows(updated);
              }} />

            <div>
              Net Meter: {net_meter} <br />
              Net Weight: {net_weight} <br />
              Wt/Meter: {wpm}
            </div>

            <hr />

            <strong>Mark Points</strong>
            {row.marks.map((mark: number, mIndex: number) => (
              <input
                key={mIndex}
                type="number"
                placeholder={`Mark ${mIndex + 1}`}
                onChange={e => {
                  const updated = [...rows];
                  updated[index].marks[mIndex] = Number(e.target.value);
                  setRows(updated);
                }}
              />
            ))}

            <button onClick={() => addMark(index)}>Add Mark</button>

            <div style={{ marginTop: 5 }}>
              <strong>Avg Lf:</strong> {avgLf}
              <br />
              <small>Issue Lf Reference: {issue?.lf_meter}</small>
            </div>

            <button onClick={() => deleteRow(index)}>Delete Roll</button>
          </div>
        );
      })}

      <hr />

      <button disabled={!isValid()} onClick={handleSave}>
        Save Production
      </button>

    </div>
  );
}