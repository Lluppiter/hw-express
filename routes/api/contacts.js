const express = require("express");

const ctrl = require("../../controllers/contacts");

const { validateBody, authentificate } = require("../../middlewares");

const { schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", authentificate, ctrl.getAll);

router.get("/:contactId", authentificate, ctrl.getById);

router.post("/", authentificate, validateBody(schemas.addSchema), ctrl.addNew);

router.delete("/:contactId", authentificate, ctrl.deleteById);

router.put(
  "/:contactId",
  authentificate,
  validateBody(schemas.addSchema),
  ctrl.updateById
);

router.patch(
  "/:contactId/favorite",
  authentificate,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusContact
);

module.exports = router;
