import { Router } from "express";
import protect from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  createLinkSchema,
  getVaultLinksSchema,
  updateLinkSchema,
} from "../../validators/link.validators";
import {
  createLinkHandler,
  deleteLinkHandler,
  getLinkByIdHandler,
  getVaultLinkshandler,
  toggleFavouriteHandler,
  updateLinkHandler,
} from "./link.controller";

const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", validate(createLinkSchema), createLinkHandler);
router.get("/", validate(getVaultLinksSchema), getVaultLinkshandler);
router.get("/:linkId", getLinkByIdHandler);
router.patch("/:linkId", validate(updateLinkSchema), updateLinkHandler);
router.delete("/:linkId", deleteLinkHandler);
router.patch("/:linkId/favorite", toggleFavouriteHandler);

export default router;
