import express from "express";
import {
  getUserController,
  googleAuthController,
  signInController,
} from "../../controllers/auth/auth-cts";
import { authenticateUser } from "../../middlewares/auth";

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

authRouter.get("/google/signin", googleAuthController);
authRouter.get("/signin", signInController);
authRouter.get(
  "/user",
  authenticateUser as express.RequestHandler,
  getUserController as express.RequestHandler,
);

export default authRouter;
