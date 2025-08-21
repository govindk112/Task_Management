// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import taskRoutes from "./routes/tasks.routes.js";   // <-- add this
import commentRoutes from "./routes/comments.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);



app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
// Mount tasks routes at root so nested paths work:
// - /projects/:projectId/tasks
// - /tasks/:taskId
app.use("/", taskRoutes); // <-- add this


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
