import { useState } from "react";
import { api } from "../api";

export default function BeamInward() {

  const [form, setForm] = useState({
    plant_id: 1,
    beam_name_id: "",
    set_no: "",
    sizing_meter: 0,
    yarn: "",
    total_end: "",
    rs: ""
  });

  const handleSave = async () => {
    try {
      await api.post("/beam-inward", form);
      alert("Beam Inward Saved");
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h2>Beam Inward</h2>

      <input placeholder="Beam Name ID"
        onChange={e => setForm({ ...form, beam_name_id: e.target.value })} />

      <input placeholder="Set No"
        onChange={e => setForm({ ...form, set_no: e.target.value })} />

      <input type="number" placeholder="Sizing Meter"
        onChange={e => setForm({ ...form, sizing_meter: Number(e.target.value) })} />

      <input placeholder="Yarn"
        onChange={e => setForm({ ...form, yarn: e.target.value })} />

      <input placeholder="Total End"
        onChange={e => setForm({ ...form, total_end: e.target.value })} />

      <input placeholder="RS"
        onChange={e => setForm({ ...form, rs: e.target.value })} />

      <button onClick={handleSave}>Save</button>
    </div>
  );
}