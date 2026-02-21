import express from "express";
import cors from "cors";
import beamIssueRoutes from "./modules/beamIssue/beamIssue.routes";
import productionRoutes from "./modules/production/production.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import loomRoutes from "./modules/loom/loom.routes";
import designRoutes from "./modules/design/design.routes";
import stockRoutes from "./modules/stock/stock.routes";
import beamInwardRoutes from "./modules/beamInward/beamInward.routes";
import beamNameRoutes from "./modules/beamName/beamName.routes";
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Airjet ERP Backend Running");
});

app.use("/api/beam-issues", beamIssueRoutes);
app.use("/api/production-entry", productionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/looms", loomRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/beam-inwards", beamInwardRoutes);
app.use("/api/beam-names", beamNameRoutes);
export default app;