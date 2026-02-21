import { useEffect, useState } from "react";
import { api } from "../api";

export default function ActiveLooms() {

  const [looms, setLooms] = useState<any[]>([]);

  useEffect(() => {
    api.get("/active-looms?plant_id=1")
      .then(res => setLooms(res.data.data))
      .catch(() => alert("Failed"));
  }, []);

  return (
    <div>
      <h2>Active Looms</h2>

      {looms.map(l => (
        <div key={l.loom_id} style={{
          background: "#e9f7ff",
          padding: 10,
          marginBottom: 10
        }}>
          Loom: {l.loom_no} <br />
          Beam: {l.beam_no} <br />
          Design: {l.design_no}
        </div>
      ))}
    </div>
  );
}