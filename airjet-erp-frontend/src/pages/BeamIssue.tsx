import { useEffect, useState } from "react";
import { api } from "../api";

export default function BeamIssue() {

  const [looms, setLooms] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [form, setForm] = useState({
    plant_id: 1,
    beam_no: "",
    loom_no: "",
    set_no: "",
    design_no: "",
    expected_meter: 0
  });

  // 🔹 Load Loom List
  useEffect(() => {
    api.get("/looms?plant_id=1")
       .then(res => setLooms(res.data.data));

    api.get("/designs?plant_id=1")
       .then(res => setDesigns(res.data.data));
  }, []);

  // 🔹 Handle Submit
  const handleSubmit = async () => {
    try {
      const res = await api.post("/beam-issues", form);

      // If warning (active loom already running beam)
      if (res.data.warning) {

        const active = res.data.data;

        const confirmComplete = window.confirm(
          `Loom already running Beam ${active.beam_no}
Expected: ${active.expected_meter}
Produced: ${active.produced_meter}

Do you want to complete this beam?`
        );

        if (confirmComplete) {
          await api.post("/beam-issues/complete", {
            issue_id: active.issue_id
          });

          // Retry issuing new beam
          await api.post("/beam-issues", form);
          alert("Previous beam completed. New beam issued successfully.");
        }

        return;
      }

      alert("Beam Issued Successfully");

    } catch (err: any) {
      alert(err.response?.data?.message || "Error issuing beam");
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>Beam Issue</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Beam No:</label><br />
        <input
          type="text"
          value={form.beam_no}
          onChange={e => setForm({ ...form, beam_no: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Select Loom:</label><br />
        <select
          value={form.loom_no}
          onChange={e => setForm({ ...form, loom_no: e.target.value })}
        >
          <option value="">Select Loom</option>
          {looms.map((l: any) => (
            <option key={l.loom_id} value={l.loom_no}>
              {l.loom_no}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Set No:</label><br />
        <input
          type="text"
          value={form.set_no}
          onChange={e => setForm({ ...form, set_no: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Design No:</label><br />
        <select
          value={form.design_no}
          onChange={e => setForm({ ...form, design_no: e.target.value })}
        >
          <option value="">Select Design</option>
          {designs.map((d: any) => (
            <option key={d.design_id} value={d.design_no}>
              {d.design_no}
            </option>
          ))}
        </select>

      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Expected Meter:</label><br />
        <input
          type="number"
          value={form.expected_meter}
          onChange={e => setForm({ ...form, expected_meter: Number(e.target.value) })}
        />
      </div>

      <button onClick={handleSubmit}>
        Issue Beam
      </button>

    </div>
  );
}