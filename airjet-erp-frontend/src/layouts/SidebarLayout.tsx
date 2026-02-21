import { Link, Outlet } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Sidebar */}
      <div style={{
        width: 250,
        background: "#1e293b",
        color: "white",
        padding: 20
      }}>
        <h2>Airjet ERP</h2>

        <div style={{ marginTop: 20 }}>
          <Link to="/office/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/office/beam-inward" style={linkStyle}>Beam Inward</Link>
          <Link to="/office/beam-issue" style={linkStyle}>Beam Issue</Link>
          <Link to="/office/stock" style={linkStyle}>Stock</Link>
          <Link to="/office/loom-master" style={linkStyle}>Loom</Link>
          <Link to="/office/design-master" style={linkStyle}>Design</Link>
          <Link to="/office/alerts" style={linkStyle}>Alerts</Link>
          <Link to="/office/beam-inward">Beam Inward</Link>
          <Link to="/office/beam-master">Beam Master</Link>
          <Link to="/office/active-looms">Active Looms</Link>
          <Link to="/office/alerts">Alerts</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  marginBottom: 10
};