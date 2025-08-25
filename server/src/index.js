// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import taskRoutes from "./routes/tasks.routes.js";   // <-- add this
import commentRoutes from "./routes/comments.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import userRoutes from "./routes/user.routes.js";
import userProfileRoutes from "./routes/user.profile.js";



dotenv.config();

const app = express();
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only your frontend origin
  credentials: true, // Allow credentials (cookies, etc.)
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use("/profile", userProfileRoutes);




app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
// Mount tasks routes at root so nested paths work:
// - /projects/:projectId/tasks
// - /tasks/:taskId
app.use("/projects", taskRoutes); // <-- add this


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
