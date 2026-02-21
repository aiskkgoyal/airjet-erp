import app from "./app";
import { pool } from "./config/db";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.connect();
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

start();