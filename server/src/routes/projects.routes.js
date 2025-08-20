import { Router } from "express";
const router = Router();

router.post("/register", (req, res) => {
  return res.status(501).json({ message: "register not implemented yet" });
});

router.post("/login", (req, res) => {
  return res.status(501).json({ message: "login not implemented yet" });
});

export default router;
