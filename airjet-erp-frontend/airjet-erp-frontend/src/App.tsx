// src/App.tsx  — restore original top-navbar layout
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BeamIssue from "./pages/BeamIssue";
import ProductionEntry from "./pages/ProductionEntry";
import OfficePanel from "./pages/OfficePanel";
import LoomMaster from "./pages/LoomMaster";
import DesignMaster from "./pages/DesignMaster";
import Stock from "./pages/Stock";
import StockDetails from "./pages/StockDetails";
import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <div className="layout">

        <nav className="navbar">
          <h2>Airjet ERP</h2>

          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/beam-issue">Beam Issue</Link>
            <Link to="/production-entry">Production</Link>
            <Link to="/office">Office</Link>
            <Link to="/stock">Stock</Link>
            <Link to="/loom-master">Loom</Link>
            <Link to="/design-master">Design</Link>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/beam-issue" element={<BeamIssue />} />
            <Route path="/production-entry" element={<ProductionEntry />} />
            <Route path="/office" element={<OfficePanel />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/stock-details" element={<StockDetails />} />
            <Route path="/loom-master" element={<LoomMaster />} />
            <Route path="/design-master" element={<DesignMaster />} />
          </Routes>
        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;