import { Outlet } from "react-router-dom";

export default function LabourLayout() {
  return (
    <div style={{
      padding: 20,
      background: "#f4f4f4",
      minHeight: "100vh"
    }}>
      <Outlet />
    </div>
  );
}