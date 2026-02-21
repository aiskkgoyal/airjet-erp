import { useEffect, useState } from "react";
import { api } from "../api";

export default function Alerts() {

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/alerts?plant_id=1")
      .then(res => setAlerts(res.data.data))
      .catch(() => alert("Failed to load alerts"));
  }, []);

  return (
    <div>
      <h2>System Alerts</h2>

      {alerts.length === 0 && <p>No Alerts</p>}

      {alerts.map((a, i) => (
        <div key={i} style={{
          background: "#f8d7da",
          padding: 10,
          marginBottom: 10
        }}>
          {a.message}
        </div>
      ))}
    </div>
  );
}