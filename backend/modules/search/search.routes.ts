import { Router } from "express";
import protect from "../../middlewares/auth.middleware";
import { searchSchema } from "../../validators/search.validators";
import { searchHandler } from "./search.controller";
import validate from "../../middlewares/validate.middleware";

const router = Router();

router.use(protect);

router.get("/", validate(searchSchema), searchHandler);

export default router;
