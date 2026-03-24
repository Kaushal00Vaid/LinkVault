import { Router } from "express";
import {
  browsePublicVaultsHandler,
  searchPublicVaultsHandler,
  getPublicVaultBySlugHandler,
  clonePublicVaultHandler,
} from "./public.controller";
import protect from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  browsePublicVaultsSchema,
  searchPublicVaultsSchema,
} from "../../validators/public.validators";

const router = Router();

// Open routes — no auth required
router.get(
  "/vaults",
  validate(browsePublicVaultsSchema),
  browsePublicVaultsHandler,
);
router.get(
  "/vaults/search",
  validate(searchPublicVaultsSchema),
  searchPublicVaultsHandler,
);
router.get("/vaults/:slug", getPublicVaultBySlugHandler);

// Protected — auth required
router.post("/vaults/:slug/clone", protect, clonePublicVaultHandler);

export default router;
