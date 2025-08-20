import { Router } from "express";
const router = Router();

router.get("/:id/tasks", (req, res) => {
  const { id } = req.params;
  return res.status(200).json([{ projectId: id, title: "Sample Task" }]);
});

router.post("/:id/tasks", (req, res) => {
  const { id } = req.params;
  return res.status(201).json({ projectId: id, title: "Created Task" });
});

export default router;
