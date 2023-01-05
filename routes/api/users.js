const express = require("express");

const ctrl = require("../../controllers/users");

const { authentificate, upload } = require("../../middlewares");

const router = express.Router();

router.patch(
  "/avatars",
  authentificate,
  upload.single("avatar"),
  ctrl.changeAvatar
);

module.exports = router;
