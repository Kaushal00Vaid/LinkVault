import { Router } from "express";
import validate from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../../validators/auth.validators";
import {
  githubCallback,
  githubRedirect,
  googleCallback,
  googleRedirect,
  login,
  logout,
  refresh,
  register,
} from "./auth.controller";
import protect from "../../middlewares/auth.middleware";

const router = Router();

// email pass
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);
router.post("/refresh", refresh);

// google
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

// github
router.get("/github", githubRedirect);
router.get("/github/callback", githubCallback);

export default router;
