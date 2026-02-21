import { useState } from "react";
import { api } from "../api";

export default function BeamMaster() {

  const [form, setForm] = useState({
    beam_name: "",
    yarn: "",
    total_end: "",
    rs: ""
  });

  const handleSave = async () => {
    try {
      await api.post("/beam-master", form);
      alert("Beam Master Saved");
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h2>Beam Master</h2>

      <input placeholder="Beam Name"
        onChange={e => setForm({ ...form, beam_name: e.target.value })} />

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