import { Router } from "express";
import protect from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  createVaultSchema,
  updateVaultSchema,
} from "../../validators/vault.validators";
import {
  createVaultHandler,
  deleteVaultHandler,
  getUserVaultsHandler,
  getVaultBySlugHandler,
  updateVaultHandler,
} from "./vault.controller";

const router = Router();

// all vault routes protected
router.use(protect);

router.post("/", validate(createVaultSchema), createVaultHandler);
router.get("/", getUserVaultsHandler);
router.get("/:slug", getVaultBySlugHandler);
router.patch("/:slug", validate(updateVaultSchema), updateVaultHandler);
router.delete("/:slug", deleteVaultHandler);

export default router;
