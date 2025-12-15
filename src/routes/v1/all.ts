import express from "express";
import authRouter from "./auth-rts";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  res.send("Pexai api v1");
});

router.use("/auth", authRouter);

export default router;
