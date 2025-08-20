import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // ✅ Allow frontend 
app.use(express.json()); // to parse JSON body

// Mount your auth routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
