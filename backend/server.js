import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";

import profileRoutes from "./src/routes/profileRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/profiles", profileRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => res.send("Event Management API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
